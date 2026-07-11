const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Aplicar doble candado de seguridad a todas las rutas de este enrutador
router.use(authMiddleware);
router.use(adminMiddleware);

// Rutas de administración de Usuarios
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.put('/users/:id/role', adminController.changeUserRole);
router.post('/fake-data', adminController.generateFakeUsers);

// Rutas de reportes movidas a reportRoutes.js

const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + require('node:crypto').randomInt(0, 1000000000);
    cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Rutas de administración de Tickets de Soporte
router.get('/tickets', adminController.getAllTickets);
router.put('/tickets/:id/status', adminController.updateTicketStatus);

// Ruta para subida de imágenes
router.post('/upload', upload.single('image'), adminController.uploadImage);

// Rutas de analíticas de usuarios
router.get('/users/stats', adminController.getUserStats);

// Rutas de analíticas de noticias
router.get('/news/stats', newsController.getNewsStats);

module.exports = router;
