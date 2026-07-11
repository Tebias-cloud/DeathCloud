/**
 * REPOSITORY: moderationRepository
 * Capa de acceso a datos para la gestión y moderación de reportes de comentarios.
 * Utiliza el pool de conexión existente en '../config/db'.
 */

const pool = require('../config/db');

class ModerationRepository {
    /**
     * Registra un nuevo reporte en la base de datos.
     * @param {number} comentarioId - ID del comentario a reportar.
     * @param {number} usuarioReportaId - ID del usuario que reporta.
     * @param {string} motivo - Motivo de la denuncia.
     * @returns {Promise<object>} El reporte creado.
     */
    async createReport(comentarioId, usuarioReportaId, motivo) {
        const result = await pool.query(
            `INSERT INTO reportes (comentario_id, usuario_reporta_id, motivo)
             VALUES ($1, $2, $3)
             RETURNING id, comentario_id, usuario_reporta_id, motivo, estado, fecha_reporte`,
            [comentarioId, usuarioReportaId, motivo]
        );
        return result.rows[0];
    }

    /**
     * Obtiene la lista completa de reportes con detalles de comentario y denunciante.
     * Realiza un JOIN para cumplir con la especificación de mapear
     * news_comments.comment_text y users.username.
     * @returns {Promise<Array>} Lista de reportes detallada.
     */
    async getReports() {
        // Intenta con JOIN completo primero (tablas news_comments + users)
        try {
            const query = `
                SELECT 
                    r.id,
                    r.comentario_id,
                    r.usuario_reporta_id,
                    r.motivo,
                    r.estado,
                    r.fecha_reporte,
                    COALESCE(c.comment_text, nc.content, '(comentario eliminado)') as comment_text,
                    COALESCE(u.username, usr.nombre_usuario, 'Usuario desconocido') as username
                FROM reportes r
                LEFT JOIN news_comments c ON r.comentario_id = c.id
                LEFT JOIN comentarios nc ON r.comentario_id = nc.id
                LEFT JOIN users u ON r.usuario_reporta_id = u.id
                LEFT JOIN usuarios usr ON r.usuario_reporta_id = usr.id
                ORDER BY r.fecha_reporte DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (err) {
            console.warn('getReports JOIN failed, using fallback:', err.message);
            // Fallback: solo datos de la tabla reportes sin JOIN
            try {
                const result = await pool.query(`
                    SELECT id, comentario_id, usuario_reporta_id, motivo, estado, fecha_reporte,
                           '(comentario)' as comment_text, 'Usuario #' || usuario_reporta_id::text as username
                    FROM reportes
                    ORDER BY fecha_reporte DESC
                `);
                return result.rows;
            } catch (error_) {
                console.error('getReports fallback also failed:', error_.message);
                return [];
            }
        }
    }

    /**
     * Actualiza el estado administrativo de un reporte (e.g., 'Aprobado', 'Rechazado').
     * @param {number} id - ID del reporte.
     * @param {string} estado - Nuevo estado.
     * @returns {Promise<object>} El reporte actualizado.
     */
    async updateReportStatus(id, estado) {
        const result = await pool.query(
            `UPDATE reportes 
             SET estado = $1 
             WHERE id = $2 
             RETURNING id, comentario_id, usuario_reporta_id, motivo, estado, fecha_reporte`,
            [estado, id]
        );
        return result.rows[0];
    }

    /**
     * Elimina físicamente un comentario infractor de la tabla news_comments.
     * Debido a la restricción ON DELETE CASCADE, esto eliminará automáticamente 
     * todos los reportes vinculados a este comentario en la tabla reportes.
     * @param {number} comentarioId - ID del comentario a eliminar.
     * @returns {Promise<boolean>} True si se eliminó algún registro.
     */
    async deleteComment(comentarioId) {
        const result = await pool.query(
            `DELETE FROM news_comments WHERE id = $1`,
            [comentarioId]
        );
        return result.rowCount > 0;
    }

    /**
     * Verifica si existe un reporte duplicado del mismo usuario para el mismo comentario.
     * @param {number} comentarioId 
     * @param {number} usuarioReportaId 
     * @returns {Promise<boolean>} True si ya existe.
     */
    async checkDuplicateReport(comentarioId, usuarioReportaId) {
        const result = await pool.query(
            `SELECT id FROM reportes WHERE comentario_id = $1 AND usuario_reporta_id = $2`,
            [comentarioId, usuarioReportaId]
        );
        return result.rows.length > 0;
    }
}

module.exports = new ModerationRepository();
