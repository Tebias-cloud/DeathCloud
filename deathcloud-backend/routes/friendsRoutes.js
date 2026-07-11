const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const authMiddleware = require('../middleware/authMiddleware');

// Proteger todas las rutas de amigos con autenticación JWT
router.use(authMiddleware);

// Rutas de Amigos
router.post('/request', friendsController.sendFriendRequest);
router.get('/', friendsController.getFriendsAndRequests);
router.put('/respond', friendsController.respondFriendRequest);
router.delete('/remove/:id', friendsController.removeFriend);

module.exports = router;
