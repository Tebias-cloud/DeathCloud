const pool = require('../config/db');
const { getGamePool } = pool;

const getTableName = (schema, table) => {
  return schema === 'public' ? table : `${schema}.${table}`;
};

class GameRepository {
    async getCredits(gameId, userId) {
        // Los créditos ahora son globales, ignoramos el gameId para saldo
        const result = await pool.query(`SELECT credits FROM usuarios WHERE id = $1`, [userId]);
        if (result.rows.length === 0) return 0;
        return result.rows[0].credits;
    }

    async addCredits(gameId, userId, amount) {
        // Otorgar créditos globalmente
        const result = await pool.query(
            `UPDATE usuarios SET credits = credits + $1 WHERE id = $2 RETURNING credits`,
            [amount, userId]
        );
        if (result.rows.length === 0) throw new Error('Usuario no encontrado');
        return result.rows[0].credits;
    }

    async getSkins(gameId, userId) {
        const { pool: gamePool, schema } = await getGamePool(gameId);
        const table = getTableName(schema, 'user_skins');
        const result = await gamePool.query(`SELECT skin_id FROM ${table} WHERE usuario_id = $1`, [userId]);
        return result.rows.map(r => r.skin_id);
    }

    async checkSkinOwnership(gameId, userId, skinId) {
        const { pool: gamePool, schema } = await getGamePool(gameId);
        const skinsTable = getTableName(schema, 'user_skins');
        const skinCheck = await gamePool.query(
            `SELECT id FROM ${skinsTable} WHERE usuario_id = $1 AND skin_id = $2`,
            [userId, skinId]
        );
        return skinCheck.rows.length > 0;
    }

    async addSkinToInventory(gameId, userId, skinId) {
        const { pool: gamePool, schema } = await getGamePool(gameId);
        const skinsTable = getTableName(schema, 'user_skins');
        await gamePool.query(
            `INSERT INTO ${skinsTable} (usuario_id, skin_id) VALUES ($1, $2)`,
            [userId, skinId]
        );
    }

    async deductGlobalCredits(userId, price) {
        const deductRes = await pool.query(
            `UPDATE usuarios SET credits = credits - $1 WHERE id = $2 RETURNING credits`,
            [price, userId]
        );
        return deductRes.rows[0].credits;
    }

    async _singleDbBuy(gameId, userId, skinId, price, schema, pool) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const userRes = await client.query('SELECT credits FROM usuarios WHERE id = $1 FOR UPDATE', [userId]);
            if (userRes.rows.length === 0) throw new Error('Usuario no encontrado');
            const credits = userRes.rows[0].credits;
            if (credits < price) throw new Error(`E-Points insuficientes. Requiere ${price} EP.`);
            
            const skinsTable = getTableName(schema, 'user_skins');
            const skinRes = await client.query(`SELECT id FROM ${skinsTable} WHERE usuario_id = $1 AND skin_id = $2`, [userId, skinId]);
            if (skinRes.rows.length > 0) throw new Error('Ya has adquirido este artículo.');
            
            const deductRes = await client.query('UPDATE usuarios SET credits = credits - $1 WHERE id = $2 RETURNING credits', [price, userId]);
            await client.query(`INSERT INTO ${skinsTable} (usuario_id, skin_id) VALUES ($1, $2)`, [userId, skinId]);
            
            await client.query('COMMIT');
            return deductRes.rows[0].credits;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async _crossDbBuy(gameId, userId, skinId, price, schema, gamePool) {
        const skinsTable = getTableName(schema, 'user_skins');
        const skinCheck = await gamePool.query(`SELECT id FROM ${skinsTable} WHERE usuario_id = $1 AND skin_id = $2`, [userId, skinId]);
        if (skinCheck.rows.length > 0) throw new Error('Ya has adquirido este artículo.');
        
        const deductRes = await pool.query(
            `UPDATE usuarios SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING credits`,
            [price, userId]
        );
        if (deductRes.rows.length === 0) throw new Error(`E-Points insuficientes. Requiere ${price} EP.`);
        
        try {
            await gamePool.query(`INSERT INTO ${skinsTable} (usuario_id, skin_id) VALUES ($1, $2)`, [userId, skinId]);
        } catch (err) {
            await pool.query(`UPDATE usuarios SET credits = credits + $1 WHERE id = $2`, [price, userId]);
            console.error('Error insertando skin en juego externo:', err);
            throw new Error('Error al registrar el artículo. Se han devuelto los E-Points.');
        }
        return deductRes.rows[0].credits;
    }

    async buySkinAtomic(gameId, userId, skinId, price) {
        const { pool: gamePool, schema, isFallback } = await getGamePool(gameId);
        
        if (isFallback || pool === gamePool) {
            return await this._singleDbBuy(gameId, userId, skinId, price, schema, pool);
        } else {
            return await this._crossDbBuy(gameId, userId, skinId, price, schema, gamePool);
        }
    }

    async updateScore(gameId, userId, newScore) {
        const { pool: gamePool, schema } = await getGamePool(gameId);
        const table = getTableName(schema, 'user_stats');
        
        let result = await gamePool.query(`SELECT best_score FROM ${table} WHERE usuario_id = $1`, [userId]);
        
        if (result.rows.length === 0) {
            await gamePool.query(
                `INSERT INTO ${table} (usuario_id, best_score, total_games) VALUES ($1, $2, 1)`,
                [userId, newScore]
            );
            return { newBest: true, score: newScore };
        } else {
            const currentBest = result.rows[0].best_score;
            if (newScore > currentBest) {
                await gamePool.query(
                    `UPDATE ${table} SET best_score = $1, total_games = total_games + 1 WHERE usuario_id = $2`,
                    [newScore, userId]
                );
                return { newBest: true, score: newScore };
            } else {
                await gamePool.query(
                    `UPDATE ${table} SET total_games = total_games + 1 WHERE usuario_id = $1`,
                    [userId]
                );
                return { newBest: false, score: currentBest };
            }
        }
    }

    async getLeaderboard(gameId, limit = 10) {
        const { pool: gamePool, schema } = await getGamePool(gameId);
        const statsTable = getTableName(schema, 'user_stats');
        
        const query = `
            SELECT u.id, u.nombre_usuario, u.nickname, u.avatar_url, s.best_score 
            FROM ${statsTable} s
            JOIN usuarios u ON s.usuario_id = u.id
            ORDER BY s.best_score DESC
            LIMIT $1
        `;
        
        const result = await gamePool.query(query, [limit]);
        return result.rows;
    }

    async getGameNews(gameId) {
        const result = await pool.query('SELECT * FROM news_articles WHERE game_id = $1 ORDER BY date DESC', [gameId]);
        return result.rows;
    }

    async getNewsComments(newsId) {
        const result = await pool.query(`
            SELECT c.id, c.content, c.date, c.likes, u.nickname as author_name, u.avatar_url as author_avatar
            FROM news_comments c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.news_id = $1
            ORDER BY c.date DESC
        `, [newsId]);
        return result.rows;
    }

    async addNewsComment(newsId, userId, content) {
        const result = await pool.query(`
            INSERT INTO news_comments (news_id, usuario_id, content) 
            VALUES ($1, $2, $3) RETURNING id, content, date, likes
        `, [newsId, userId, content]);
        return result.rows[0];
    }
}

module.exports = new GameRepository();
