const adminService = require('../services/admin.service');
const { logSecurityEvent } = require('../utils/logger');

exports.getUsers = async (req, res) => {
    try {
        const users = await adminService.getUsers();
        res.json({ success: true, users });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al obtener la lista de usuarios." });
    }
};

exports.toggleBanUser = async (req, res) => {
    try {
        const { baneado, motivo_ban } = req.body;
        const user = await adminService.toggleBanUser(req.user.id, req.params.id, baneado, motivo_ban);
        
        // Registro de seguridad
        logSecurityEvent(
            baneado ? 'BAN_USER' : 'UNBAN_USER',
            req.user.id,
            req.params.id,
            `Motivo proporcionado: ${motivo_ban || 'Ninguno'}`
        );

        res.json({
            success: true,
            message: baneado ? "Usuario suspendido correctamente." : "Usuario reactivado correctamente.",
            user
        });
    } catch (err) {
        if (err.message.startsWith('Acción denegada')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === 'Usuario no encontrado.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al suspender/reactivar usuario:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el estado de suspensión." });
    }
};

exports.changeUserRole = async (req, res) => {
    try {
        const user = await adminService.changeUserRole(req.user.id, req.params.id, req.body.rol);
        
        // Registro de seguridad
        logSecurityEvent(
            'CHANGE_ROLE',
            req.user.id,
            req.params.id,
            `Nuevo rol asignado: ${req.body.rol}`
        );

        res.json({ success: true, message: `Rol actualizado a '${req.body.rol}' exitosamente.`, user });
    } catch (err) {
        if (err.message.startsWith('Rol no válido') || err.message.startsWith('Acción denegada')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === 'Usuario no encontrado.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al cambiar rol del usuario:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el rol." });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await adminService.getAllTickets();
        res.json({ success: true, tickets });
    } catch (err) {
        console.error('Error al obtener todos los tickets:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar tickets." });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const ticket = await adminService.updateTicketStatus(req.params.id, req.body.estado);
        res.json({ success: true, message: "Estado actualizado exitosamente.", ticket });
    } catch (err) {
        if (err.message === 'Estado inválido.') {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === 'Ticket no encontrado.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al actualizar ticket:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al actualizar ticket." });
    }
};

exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No se subió ninguna imagen." });
        }
        const imageUrl = `/api/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl, message: "Imagen subida exitosamente" });
    } catch (err) {
        console.error('Error al subir imagen:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al subir la imagen." });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const stats = await adminService.getUserStats();
        res.json({ success: true, stats });
    } catch (err) {
        console.error('Error al obtener estadísticas de usuarios:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar estadísticas." });
    }
};

exports.generateFakeUsers = async (req, res) => {
    try {
        const count = req.body.count || 10;
        const inserted = await adminService.generateFakeUsers(count);
        res.json({ success: true, message: `Se generaron ${inserted} usuarios falsos.` });
    } catch (err) {
        console.error('Error al generar usuarios falsos:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor al generar usuarios falsos." });
    }
};

