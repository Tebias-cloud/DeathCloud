const ticketRepository = require('../repositories/ticket.repository');

class TicketService {
    async createTicket(userId, title, description, category) {
        return await ticketRepository.create(userId, title, description, category);
    }

    async getMyTickets(userId) {
        return await ticketRepository.getByUserId(userId);
    }
}

module.exports = new TicketService();
