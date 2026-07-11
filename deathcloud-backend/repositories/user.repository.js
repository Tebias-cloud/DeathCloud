const pool = require('../config/db');

class UserRepository {
    async findByEmailOrUsername(email, username) {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1 OR nombre_usuario = $2',
            [email, username]
        );
        return result.rows;
    }

    async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    async create(username, email, passwordHash) {
        const result = await pool.query(
            'INSERT INTO usuarios (nombre_usuario, nickname, email, clave_encriptada, rol, baneado) VALUES ($1, $1, $2, $3, \'user\', false) RETURNING id, nombre_usuario, nickname, email, rol',
            [username, email, passwordHash]
        );
        return result.rows[0];
    }

    async createSession(userId, token, ip, userAgent) {
        await pool.query(
            'INSERT INTO sesiones_activas (usuario_id, token, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
            [userId, token, ip, userAgent]
        );
    }

    async getSessionsByUser(userId) {
        const result = await pool.query(
            'SELECT id, ip_address, user_agent, fecha_creacion, token FROM sesiones_activas WHERE usuario_id = $1 ORDER BY fecha_creacion DESC',
            [userId]
        );
        return result.rows;
    }

    async revokeSession(sessionId, userId) {
        const result = await pool.query(
            'DELETE FROM sesiones_activas WHERE id = $1 AND usuario_id = $2',
            [sessionId, userId]
        );
        return result.rowCount;
    }

    async deleteSessionByToken(token, userId) {
        await pool.query(
            'DELETE FROM sesiones_activas WHERE token = $1 AND usuario_id = $2',
            [token, userId]
        );
    }

    async getProfile(userId) {
        const result = await pool.query(
            'SELECT id, nombre_usuario, nickname, email, rol, avatar_url, bio, fecha_creacion FROM usuarios WHERE id = $1',
            [userId]
        );
        return result.rows[0];
    }

    async updateProfile(userId, avatar_url, bio, nickname) {
        const result = await pool.query(
            'UPDATE usuarios SET avatar_url = $1, bio = $2, nickname = $3 WHERE id = $4 RETURNING id, nombre_usuario, nickname, email, avatar_url, bio, fecha_creacion',
            [avatar_url, bio, nickname, userId]
        );
        return result.rows[0];
    }

    async getUserById(userId) {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
        return result.rows[0];
    }

    async updatePassword(userId, passwordHash) {
        await pool.query('UPDATE usuarios SET clave_encriptada = $1 WHERE id = $2', [passwordHash, userId]);
    }

    async checkUsernameExists(username, excludeUserId) {
        const result = await pool.query('SELECT id FROM usuarios WHERE nombre_usuario = $1 AND id <> $2', [username, excludeUserId]);
        return result.rows.length > 0;
    }

    async updateUsername(userId, username) {
        await pool.query('UPDATE usuarios SET nombre_usuario = $1 WHERE id = $2', [username, userId]);
    }

    async getPublicProfile(username) {
        const result = await pool.query(
            'SELECT nombre_usuario, nickname, rol, avatar_url, bio, fecha_creacion FROM usuarios WHERE nombre_usuario = $1 OR nickname = $1 LIMIT 1',
            [username]
        );
        return result.rows[0];
    }

    async getGlobalCredits(userId) {
        const result = await pool.query('SELECT credits FROM usuarios WHERE id = $1', [userId]);
        return result.rows.length > 0 ? result.rows[0].credits : 0;
    }

    async addGlobalCredits(userId, amount) {
        const result = await pool.query(
            'UPDATE usuarios SET credits = credits + $1 WHERE id = $2 RETURNING credits',
            [amount, userId]
        );
        return result.rows[0].credits;
    }

    async getGlobalInventory(userId) {
        const query = `
            SELECT skin_id FROM deathcloud_runner.user_skins WHERE usuario_id = $1
            UNION ALL
            SELECT skin_id FROM deathcloud_toxic_skies.user_skins WHERE usuario_id = $1
            UNION ALL
            SELECT skin_id FROM deathcloud_2d_shooter.user_skins WHERE usuario_id = $1
        `;
        try {
            const result = await pool.query(query, [userId]);
            return result.rows.map(row => row.skin_id);
        } catch (e) {
            console.error('Error fetching global inventory. Ignoring missing schemas.', e);
            return [];
        }
    }
}

module.exports = new UserRepository();
