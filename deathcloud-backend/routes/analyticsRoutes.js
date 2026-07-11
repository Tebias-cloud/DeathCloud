const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Aplicar doble candado de seguridad a todas las rutas de este enrutador
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', analyticsController.getDashboardStats);

module.exports = router;
