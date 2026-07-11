const friendService = require('../services/friend.service');

exports.sendFriendRequest = async (req, res) => {
    const { friendUsername } = req.body;

    if (!friendUsername) {
        return res.status(400).json({ success: false, message: "Debe suministrar el nombre de usuario o nickname del usuario." });
    }

    try {
        const { request, actualFriendUsername } = await friendService.sendFriendRequest(req.user.id, friendUsername);

        res.status(201).json({
            success: true,
            message: `Solicitud de amistad enviada a '${actualFriendUsername}' exitosamente.`,
            request
        });
    } catch (err) {
        if (err.message.includes('no existe') || err.message.includes('a ti mismo') || err.message.includes('Ya eres amigo') || err.message.includes('ya has enviado') || err.message.includes('ya te ha enviado')) {
            return res.status(err.message.includes('no existe') ? 404 : 400).json({ success: false, message: err.message });
        }
        console.error('Error al enviar solicitud de amistad:', err);
        res.status(500).json({ success: false, message: "Error interno al enviar la solicitud de amistad." });
    }
};

exports.getFriendsAndRequests = async (req, res) => {
    try {
        const data = await friendService.getFriendsAndRequests(req.user.id);
        res.json({
            success: true,
            ...data
        });
    } catch (err) {
        console.error('Error al obtener amigos:', err);
        res.status(500).json({ success: false, message: "Error interno al obtener el listado de amistades." });
    }
};

exports.respondFriendRequest = async (req, res) => {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
        return res.status(400).json({ success: false, message: "Debe suministrar el ID de la solicitud y la acción." });
    }

    try {
        const message = await friendService.respondFriendRequest(req.user.id, requestId, action);
        res.json({ success: true, message });
    } catch (err) {
        if (err.message.includes('no encontrada') || err.message.includes('permisos')) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al responder solicitud de amistad:', err);
        res.status(500).json({ success: false, message: "Error interno al procesar la solicitud de amistad." });
    }
};

exports.removeFriend = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Debe suministrar el ID de la amistad." });
    }

    try {
        const message = await friendService.removeFriend(req.user.id, id);
        res.json({ success: true, message });
    } catch (err) {
        if (err.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al eliminar amigo:', err);
        res.status(500).json({ success: false, message: "Error interno al eliminar amigo." });
    }
};
