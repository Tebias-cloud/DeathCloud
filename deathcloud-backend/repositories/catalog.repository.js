const pool = require('../config/db');

class CatalogRepository {
    async getGames() {
        const result = await pool.query('SELECT * FROM games_catalog');
        return result.rows;
    }

    async createGame(gameData) {
        // gameData = { displayname, tagline, subtagline, assets (json string), theme }
        const id = gameData.displayname.toLowerCase().replaceAll(/[^a-z0-9]/g, '-');
        
        await pool.query(
            `INSERT INTO games_catalog (id, displayname, tagline, subtagline, assets, theme)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, gameData.displayname, gameData.tagline, gameData.subtagline, gameData.assets || '{}', gameData.theme || '{"theme-neon":"#00d2ff"}']
        );
        return id;
    }

    async updateGame(id, gameData) {
        await pool.query(
            `UPDATE games_catalog SET displayname=$1, tagline=$2, subtagline=$3, assets=$4, theme=$5 WHERE id=$6`,
            [gameData.displayname, gameData.tagline, gameData.subtagline, gameData.assets || '{}', gameData.theme || '{"theme-neon":"#00d2ff"}', id]
        );
    }

    async deleteGame(id) {
        // El schema del juego es el ID con caracteres no alfanuméricos reemplazados por '_'
        const dbSuffix = id.replaceAll(/[^a-zA-Z0-9]/g, '_');
        
        // 1. Borrar de la tabla de catálogo
        await pool.query(`DELETE FROM games_catalog WHERE id=$1`, [id]);
        
        // 2. Intentar borrar el schema de la base de datos (y su contenido completo CASCADE)
        try {
            await pool.query(`DROP SCHEMA IF EXISTS "${dbSuffix}" CASCADE`);
            console.log(`Schema '${dbSuffix}' eliminado exitosamente.`);
        } catch (err) {
            console.error(`Error al eliminar schema '${dbSuffix}':`, err);
        }
    }

    async getStoreItemsByGameId(gameId) {
        const result = await pool.query('SELECT * FROM store_items WHERE game_id = $1', [gameId]);
        return result.rows;
    }

    async getNewsArticlesByGameId(gameId) {
        const result = await pool.query('SELECT * FROM news_articles WHERE game_id = $1', [gameId]);
        return result.rows;
    }

    async createStoreItem(itemData) {
        const { id, game_id, title, category, rarity, rarityColor, description, image, price } = itemData;
        await pool.query(
            `INSERT INTO store_items (id, game_id, title, category, rarity, rarityColor, description, image, price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, game_id, title, category, rarity, rarityColor, description, image, price]
        );
    }

    async updateStoreItem(id, itemData) {
        const { title, category, rarity, rarityColor, description, image, price } = itemData;
        await pool.query(
            `UPDATE store_items SET title=$1, category=$2, rarity=$3, rarityColor=$4, description=$5, image=$6, price=$7 WHERE id=$8`,
            [title, category, rarity, rarityColor, description, image, price, id]
        );
    }

    async deleteStoreItem(id) {
        await pool.query(`DELETE FROM store_items WHERE id=$1`, [id]);
    }

    async createNews(newsData) {
        const { id, game_id, title, desc, date, image, status } = newsData;
        await pool.query(
            `INSERT INTO news_articles (id, game_id, title, "desc", date, image, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, game_id, title, desc, date, image, status]
        );
    }

    async updateNews(id, newsData) {
        const { title, desc, date, image, status } = newsData;
        await pool.query(
            `UPDATE news_articles SET title=$1, "desc"=$2, date=$3, image=$4, status=$5 WHERE id=$6`,
            [title, desc, date, image, status, id]
        );
    }

    async deleteNews(id) {
        await pool.query(`DELETE FROM news_articles WHERE id=$1`, [id]);
    }

    async setupGameSchema(gameId) {
        const schema = gameId.replaceAll(/[^a-zA-Z0-9]/g, '_');
        await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        
        const t = (table) => `"${schema}".${table}`;
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('user_skins')} ( id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, skin_id VARCHAR(100) NOT NULL, fecha_adquisicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('user_stats')} ( usuario_id INT PRIMARY KEY, best_score VARCHAR(50) DEFAULT '0', total_games INT DEFAULT 0, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('community_posts')} ( id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, title VARCHAR(200) NOT NULL, content TEXT NOT NULL, likes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS ${t('community_replies')} ( id SERIAL PRIMARY KEY, post_id INT NOT NULL, usuario_id INT NOT NULL, content TEXT NOT NULL, likes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`);
    }
}

module.exports = new CatalogRepository();
