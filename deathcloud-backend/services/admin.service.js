const adminRepository = require('../repositories/admin.repository');

class AdminService {
    async getUsers() {
        return await adminRepository.getUsers();
    }

    async toggleBanUser(adminId, targetUserId, baneado, motivo_ban) {
        if (Number.parseInt(targetUserId) === adminId) {
            throw new Error('Acción denegada. No puedes suspender tu propio usuario de administración.');
        }

        const updatedUser = await adminRepository.toggleBanUser(targetUserId, baneado, motivo_ban);
        if (!updatedUser) {
            throw new Error('Usuario no encontrado.');
        }

        return updatedUser;
    }

    async changeUserRole(adminId, targetUserId, rol) {
        if (!rol || !['user', 'admin'].includes(rol)) {
            throw new Error('Rol no válido. Los roles admitidos son: \'user\' o \'admin\'.');
        }

        if (Number.parseInt(targetUserId) === adminId && rol !== 'admin') {
            throw new Error('Acción denegada. No puedes remover tus propios permisos de administrador para evitar orfandad en el sistema.');
        }

        const updatedUser = await adminRepository.changeUserRole(targetUserId, rol);
        if (!updatedUser) {
            throw new Error('Usuario no encontrado.');
        }

        return updatedUser;
    }

    async getAllTickets() {
        return await adminRepository.getAllTickets();
    }

    async updateTicketStatus(id, estado) {
        const validStates = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];
        if (!validStates.includes(estado)) {
            throw new Error('Estado inválido.');
        }

        const ticket = await adminRepository.updateTicketStatus(id, estado);
        if (!ticket) {
            throw new Error('Ticket no encontrado.');
        }

        return ticket;
    }

    async getUserStats() {
        return await adminRepository.getUserStats();
    }

    async generateFakeUsers(count = 10) {
        return await adminRepository.generateFakeUsers(count);
    }
}

module.exports = new AdminService();
