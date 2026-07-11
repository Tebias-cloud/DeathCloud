const express = require('express');
const router = express.Router();
const juegosController = require('../controllers/juegosController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

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
    cb(null, 'juego-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB límite
});

// Rutas Públicas (o para cualquier usuario logueado según se necesite, aquí lo dejamos público)
router.get('/', juegosController.getJuegos);
router.get('/:id', juegosController.getJuego);

// Rutas de Administración (Protegidas)
router.post('/', authMiddleware, adminMiddleware, upload.single('portada'), juegosController.createJuego);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('portada'), juegosController.updateJuego);
router.delete('/:id', authMiddleware, adminMiddleware, juegosController.deleteJuego);

module.exports = router;
