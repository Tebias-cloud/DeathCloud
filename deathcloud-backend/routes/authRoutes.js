const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas de autenticación
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rutas de Sesiones Activas (Protegidas)
router.get('/sesiones', authMiddleware, authController.getSessions);
router.delete('/sesiones/:id', authMiddleware, authController.revokeSession);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
