const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const authMiddleware = require('../middleware/authMiddleware');

// Proteger todas las rutas de soporte con autenticación JWT
router.use(authMiddleware);

// Rutas de Tickets
router.post('/', ticketsController.createTicket);
router.get('/', ticketsController.getMyTickets);

module.exports = router;
