/**
 * SERVICE: moderationService
 * Capa intermedia de lógica de negocio para la gestión de reportes de moderación.
 * Maneja la persistencia de logs en el servidor usando el módulo nativo 'fs'.
 */

const fs = require('node:fs');
const path = require('node:path');
const moderationRepository = require('../repositories/moderationRepository');

// Rutas para el guardado de logs persistentes
const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'server.log');

/**
 * Escribe un mensaje con formato y marca de tiempo en 'logs/server.log'.
 * @param {string} message - El mensaje a registrar.
 */
function appendServerLog(message) {
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`, 'utf8');
    } catch (err) {
        console.error('⚠️ Error escribiendo logs en el servidor:', err);
    }
}

class ModerationService {
    /**
     * Registra un reporte de comentario y escribe en los logs.
     * @param {number} comentarioId - Comentario denunciado.
     * @param {number} usuarioReportaId - Usuario que reporta.
     * @param {string} motivo - Razón de la denuncia.
     */
    async reportarComentario(comentarioId, usuarioReportaId, motivo) {
        // Validar si ya se ha reportado el comentario por el mismo usuario para evitar spam
        const duplicate = await moderationRepository.checkDuplicateReport(comentarioId, usuarioReportaId);
        if (duplicate) {
            throw new Error('Ya has enviado un reporte para este comentario.');
        }

        const report = await moderationRepository.createReport(comentarioId, usuarioReportaId, motivo);
        
        // Registro de log persistente solicitado en HU #52
        appendServerLog(`REPORT_CREATED: Usuario ID ${usuarioReportaId} reportó comentario ID ${comentarioId}. Motivo: "${motivo}". Reporte ID generado: ${report.id}`);
        
        return report;
    }

    /**
     * Obtiene el listado completo de reportes y escribe en los logs.
     */
    async obtenerReportes() {
        const reportes = await moderationRepository.getReports();
        
        // Registro de log persistente solicitado en HU #52
        appendServerLog(`REPORTS_LISTED: Se listaron ${reportes.length} reportes de moderación para auditoría.`);
        
        return reportes;
    }

    /**
     * Aprueba/resuelve un reporte actualizando su estado.
     */
    async aprobarReporte(id, estado) {
        if (!['Pendiente', 'Aprobado', 'Rechazado'].includes(estado)) {
            throw new Error('Estado de reporte inválido.');
        }
        const report = await moderationRepository.updateReportStatus(id, estado);
        
        appendServerLog(`REPORT_STATUS_UPDATED: Reporte ID ${id} actualizado a estado "${estado}".`);
        return report;
    }

    /**
     * Elimina un comentario infractor (lo que elimina en cascada sus reportes) y escribe en logs.
     */
    async eliminarComentario(comentarioId) {
        const deleted = await moderationRepository.deleteComment(comentarioId);
        if (!deleted) {
            throw new Error('El comentario no existe o ya fue eliminado.');
        }

        appendServerLog(`COMMENT_DELETED_BY_MODERATOR: Comentario ID ${comentarioId} eliminado. Reportes asociados eliminados en cascada.`);
        return { success: true, message: 'Comentario y reportes relacionados eliminados correctamente.' };
    }
}

module.exports = new ModerationService();
