const ticketService = require('../services/ticket.service');

// Crear un nuevo ticket de soporte
exports.createTicket = async (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ success: false, message: "Debe suministrar título, descripción y categoría del ticket." });
    }

    const validCategories = ['cuenta', 'bug', 'tienda', 'otro', 'conexion', 'pagos', 'recuperacion', 'reporte', 'sugerencia'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, message: "Categoría inválida." });
    }

    try {
        const ticket = await ticketService.createTicket(req.user.id, title, description, category);

        res.status(201).json({
            success: true,
            message: "Ticket de soporte técnico registrado exitosamente.",
            ticket
        });
    } catch (err) {
        console.error('Error al crear ticket:', err);
        res.status(500).json({ success: false, message: "Error interno al crear el ticket de soporte." });
    }
};

// Obtener los tickets del usuario actual
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await ticketService.getMyTickets(req.user.id);

        res.json({
            success: true,
            tickets
        });
    } catch (err) {
        console.error('Error al obtener tickets:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar tus tickets de soporte." });
    }
};
