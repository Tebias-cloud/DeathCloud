const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

// Clasificación global por juego (accesible por invitados)
router.get('/game/:gameId/leaderboard', gameController.getLeaderboard);

// Operaciones específicas de usuario protegidas por sesión
router.get('/game/:gameId/credits', authMiddleware, gameController.getCredits);
// Endpoint de agregar créditos removido
router.get('/game/:gameId/skins', authMiddleware, gameController.getSkins);
router.post('/game/:gameId/skins/buy', authMiddleware, gameController.buySkin);
router.post('/game/:gameId/stats', authMiddleware, gameController.updateScore);

// Interacciones con noticias (Dashboard y Comunidad)
router.post('/game/news/:newsId/react', authMiddleware, gameController.reactToNews);
router.post('/game/news/:newsId/rate', authMiddleware, gameController.rateNews);
router.post('/game/news/:newsId/comments', authMiddleware, gameController.addNewsComment);
router.get('/game/news/:newsId/comments', gameController.getNewsComments);

module.exports = router;
