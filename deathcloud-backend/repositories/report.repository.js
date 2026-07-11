const pool = require('../config/db');

class ReportRepository {
    async getUsersForReport() {
        const result = await pool.query(
            'SELECT id, nombre_usuario, nickname, email, rol, fecha_creacion FROM usuarios ORDER BY id ASC'
        );
        return result.rows;
    }
}

module.exports = new ReportRepository();
