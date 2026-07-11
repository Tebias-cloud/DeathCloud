/**
 * ROUTER: moderationRoutes
 * Define las rutas para la denuncia de comentarios por parte de usuarios
 * y la gestión administrativa de los reportes por parte de los moderadores.
 */

const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// 1. Rutas públicas para usuarios registrados (Denunciar)
// POST /api/moderacion/reportar
router.post('/reportar', authMiddleware, moderationController.reportarComentario);

// 2. Rutas administrativas (Solo administradores / moderadores con rol admin)
// GET /api/moderacion/lista
router.get('/lista', authMiddleware, adminMiddleware, moderationController.obtenerReportes);

// PUT /api/moderacion/aprobar/:id
router.put('/aprobar/:id', authMiddleware, adminMiddleware, moderationController.aprobarReporte);

// DELETE /api/moderacion/comentario/:comentarioId
router.delete('/comentario/:comentarioId', authMiddleware, adminMiddleware, moderationController.eliminarComentario);

module.exports = router;
