const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const multer = require('multer');
const upload = multer({ 
    dest: 'public/uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit to prevent DoS (SonarQube Security Hotspot)
});

// Public route to fetch the entire catalog for the frontend context
router.get('/games', catalogController.getGames);

// Admin routes for Games
router.post('/games', authMiddleware, adminMiddleware, upload.any(), catalogController.createGame);
router.put('/games/:id', authMiddleware, adminMiddleware, upload.any(), catalogController.updateGame);
router.delete('/games/:id', authMiddleware, adminMiddleware, catalogController.deleteGame);

// Admin routes for Store Items
router.post('/store', authMiddleware, adminMiddleware, upload.any(), catalogController.createStoreItem);
router.put('/store/:id', authMiddleware, adminMiddleware, upload.any(), catalogController.updateStoreItem);
router.delete('/store/:id', authMiddleware, adminMiddleware, catalogController.deleteStoreItem);

// Admin routes for News Articles
router.post('/news', authMiddleware, adminMiddleware, upload.any(), catalogController.createNews);
router.put('/news/:id', authMiddleware, adminMiddleware, upload.any(), catalogController.updateNews);
router.delete('/news/:id', authMiddleware, adminMiddleware, catalogController.deleteNews);

module.exports = router;
