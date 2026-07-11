const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas de Perfil (protegidas selectivamente con authMiddleware)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/profile/password', authMiddleware, userController.changePassword);
router.put('/profile/deathcloud-id', authMiddleware, userController.changeDeathCloudId);
router.get('/profile/public/:username', userController.getPublicProfile);

// Rutas de Créditos Globales (E-Points)
router.get('/credits', authMiddleware, userController.getCredits);
// Endpoint para añadir créditos ha sido removido

// Ruta Inventario Global
router.get('/inventory', authMiddleware, userController.getGlobalInventory);

module.exports = router;
