const pool = require('../config/db');

class AdminRepository {
    async getUsers() {
        const result = await pool.query(
            'SELECT id, nombre_usuario, email, rol, baneado, motivo_ban, fecha_creacion FROM usuarios ORDER BY id ASC'
        );
        return result.rows;
    }

    async toggleBanUser(id, baneado, motivo_ban) {
        const result = await pool.query(
            'UPDATE usuarios SET baneado = $1, motivo_ban = $2 WHERE id = $3 RETURNING id, nombre_usuario, baneado, motivo_ban',
            [baneado, baneado ? (motivo_ban || 'Suspensión administrativa') : null, id]
        );
        return result.rows[0];
    }

    async changeUserRole(id, rol) {
        const result = await pool.query(
            'UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre_usuario, rol',
            [rol, id]
        );
        return result.rows[0];
    }

    async getAllTickets() {
        const result = await pool.query(`
            SELECT t.id, t.usuario_id, u.nombre_usuario as "usuarioNombre", u.email as "usuarioEmail", 
                   t.titulo, t.descripcion, t.categoria, t.estado, t.fecha_creacion
            FROM tickets t
            JOIN usuarios u ON t.usuario_id = u.id
            ORDER BY t.id DESC
        `);
        return result.rows;
    }

    async updateTicketStatus(id, estado) {
        const result = await pool.query(
            'UPDATE tickets SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [estado, id]
        );
        return result.rows[0];
    }

    async getUserStats() {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios) as total_users,
                (SELECT COUNT(*) FROM sesiones_activas) as active_sessions,
                (SELECT COUNT(*) FROM mensajes_privados) as total_messages
        `);
        
        const connectionsResult = await pool.query(`
            SELECT EXTRACT(HOUR FROM fecha_creacion) as hour, COUNT(*) as count
            FROM sesiones_activas
            GROUP BY EXTRACT(HOUR FROM fecha_creacion)
            ORDER BY hour ASC
        `);
        
        const stats = result.rows[0];
        stats.connections_by_hour = connectionsResult.rows;
        
        return stats;
    }

    async generateFakeUsers(count = 10) {
        const fakeUsers = [];
        for (let i = 0; i < count; i++) {
            const random = require('node:crypto').randomInt(0, 1000000);
            const nombre = `FakeUser${random}`;
            const email = `fake${random}@deathcloud.com`;
            // Un hash bcrypt genérico que no funciona para loguear, solo para cumplir constraint
            const password = '$2a$10$w1v/Jv.K1k6aL.6.K6L6u.L6L6L6L6L6L6L6L6L6L6L6L6L6L6L6';
            fakeUsers.push([nombre, email, password]);
        }
        
        let inserted = 0;
        for (const user of fakeUsers) {
            try {
                await pool.query(
                    'INSERT INTO usuarios (nombre_usuario, email, contrasena, rol, baneado) VALUES ($1, $2, $3, $4, $5)',
                    [user[0], user[1], user[2], 'user', false]
                );
                inserted++;
            } catch (err) {
                console.error('Error insertando fake user', err.message);
            }
        }
        return inserted;
    }
}

module.exports = new AdminRepository();
