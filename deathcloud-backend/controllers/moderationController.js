/**
 * CONTROLLER: moderationController
 * Controlador para gestionar las operaciones HTTP relacionadas con la moderación de comentarios.
 * Valida de forma estricta que los datos obligatorios no vengan vacíos.
 */

const moderationService = require('../services/moderationService');

/**
 * Registra una denuncia sobre un comentario específico.
 * POST /api/moderacion/reportar
 */
exports.reportarComentario = async (req, res) => {
    try {
        const { comentario_id, motivo } = req.body;
        // El usuario reporta viene de la sesión autenticada (req.user)
        const usuario_reporta_id = req.user ? req.user.id : req.body.usuario_reporta_id;

        // Validación estricta de datos obligatorios requeridos por la HU #52
        if (!comentario_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'El identificador del comentario (comentario_id) es obligatorio.' 
            });
        }
        if (!usuario_reporta_id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Debe iniciar sesión para poder reportar un comentario.' 
            });
        }
        if (!motivo || motivo.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debe especificar un motivo válido para realizar la denuncia.' 
            });
        }

        const report = await moderationService.reportarComentario(
            Number(comentario_id), 
            Number(usuario_reporta_id), 
            motivo.trim()
        );

        return res.status(201).json({
            success: true,
            message: 'Reporte registrado exitosamente. Será evaluado por el equipo de moderación.',
            data: report
        });
    } catch (err) {
        console.error('Error en reportarComentario controller:', err.message);
        if (err.message.includes('Ya has enviado')) {
            return res.status(409).json({ success: false, message: err.message });
        }
        return res.status(500).json({ 
            success: false, 
            message: 'Ocurrió un error interno al registrar el reporte.' 
        });
    }
};

/**
 * Obtiene la lista completa de comentarios reportados (Para Dashboard Administrador).
 * GET /api/moderacion/lista
 */
exports.obtenerReportes = async (req, res) => {
    try {
        // En un escenario de producción, este endpoint se restringe a administradores.
        // Se asume que el router aplica las validaciones de rol necesarias.
        const reports = await moderationService.obtenerReportes();

        return res.status(200).json({
            success: true,
            message: 'Listado de reportes recuperado exitosamente.',
            data: reports
        });
    } catch (err) {
        console.error('Error en obtenerReportes controller:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Ocurrió un error al obtener la lista de reportes.' 
        });
    }
};

/**
 * Actualiza el estado administrativo de un reporte (Aprobar o Rechazar).
 * PUT /api/moderacion/aprobar/:id
 */
exports.aprobarReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'Aprobado', 'Rechazado'

        if (!estado) {
            return res.status(400).json({
                success: false,
                message: 'El nuevo estado del reporte es obligatorio.'
            });
        }

        const report = await moderationService.aprobarReporte(Number(id), estado);
        return res.status(200).json({
            success: true,
            message: `El reporte #${id} ha sido actualizado a: ${estado}.`,
            data: report
        });
    } catch (err) {
        console.error('Error en aprobarReporte controller:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message || 'Error al actualizar el estado del reporte.'
        });
    }
};

/**
 * Elimina el comentario denunciado de forma permanente.
 * DELETE /api/moderacion/comentario/:comentarioId
 */
exports.eliminarComentario = async (req, res) => {
    try {
        const { comentarioId } = req.params;

        if (!comentarioId) {
            return res.status(400).json({
                success: false,
                message: 'El identificador del comentario es obligatorio.'
            });
        }

        const result = await moderationService.eliminarComentario(Number(comentarioId));
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (err) {
        console.error('Error en eliminarComentario controller:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message || 'Error al eliminar el comentario infractor.'
        });
    }
};
