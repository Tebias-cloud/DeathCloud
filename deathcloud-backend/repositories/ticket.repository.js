const pool = require('../config/db');

class TicketRepository {
    async create(userId, title, description, category) {
        const result = await pool.query(
            `INSERT INTO tickets (usuario_id, titulo, descripcion, categoria, estado) 
             VALUES ($1, $2, $3, $4, 'abierto') 
             RETURNING id, usuario_id, titulo, descripcion, categoria, estado, fecha_creacion`,
            [userId, title, description, category]
        );
        return result.rows[0];
    }

    async getByUserId(userId) {
        const result = await pool.query(
            'SELECT id, titulo, descripcion, categoria, estado, fecha_creacion FROM tickets WHERE usuario_id = $1 ORDER BY id DESC',
            [userId]
        );
        return result.rows;
    }
}

module.exports = new TicketRepository();
