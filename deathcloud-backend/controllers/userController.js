const userService = require('../services/user.service');

exports.getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.json({ success: true, user });
    } catch (err) {
        if (err.message === 'Usuario no encontrado en el sistema.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar el perfil." });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { avatar_url, bio, nickname } = req.body;
        const user = await userService.updateProfile(req.user.id, avatar_url, bio, nickname);
        res.json({ success: true, message: "Perfil actualizado correctamente.", user });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ success: false, message: "Error interno al actualizar datos del perfil." });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        await userService.changePassword(req.user.id, oldPassword, newPassword);
        res.json({ success: true, message: "Contraseña actualizada exitosamente." });
    } catch (err) {
        if (['Debe suministrar la contraseña actual y la nueva.', 'La contraseña actual es incorrecta.'].includes(err.message)) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === 'Usuario no encontrado.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al cambiar contraseña:', err);
        res.status(500).json({ success: false, message: "Error interno al actualizar la clave de acceso." });
    }
};

exports.changeDeathCloudId = async (req, res) => {
    try {
        const { password, newDeathCloudId } = req.body;
        const updatedId = await userService.changeDeathCloudId(req.user.id, password, newDeathCloudId);
        res.json({ success: true, message: "DeathCloud ID actualizado exitosamente.", newDeathCloudId: updatedId });
    } catch (err) {
        if (['Debe suministrar la contraseña actual y el nuevo DeathCloud ID.', 'La contraseña ingresada es incorrecta.', 'El DeathCloud ID ya está en uso.'].includes(err.message)) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message === 'Usuario no encontrado.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al cambiar DeathCloud ID:', err);
        res.status(500).json({ success: false, message: "Error interno al actualizar el DeathCloud ID." });
    }
};

exports.getPublicProfile = async (req, res) => {
    try {
        const user = await userService.getPublicProfile(req.params.username);
        res.json({ success: true, user });
    } catch (err) {
        if (err.message === 'Usuario no encontrado en el sistema.') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al obtener perfil público:', err);
        res.status(500).json({ success: false, message: "Error interno al recuperar el perfil público." });
    }
};

exports.getCredits = async (req, res) => {
    try {
        const credits = await userService.getGlobalCredits(req.user.id);
        res.json({ success: true, credits });
    } catch (err) {
        console.error('Error al obtener E-Points globales:', err);
        res.status(500).json({ success: false, message: 'Error al obtener E-Points' });
    }
};

exports.addCredits = async (req, res) => {
    try {
        const credits = await userService.addGlobalCredits(req.user.id, req.body.amount);
        res.json({ success: true, credits });
    } catch (err) {
        if (err.message === 'Cantidad no válida') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error('Error al añadir E-Points globales:', err);
        res.status(500).json({ success: false, message: 'Error al abonar E-Points' });
    }
};

exports.getGlobalInventory = async (req, res) => {
    try {
        const skins = await userService.getGlobalInventory(req.user.id);
        res.json({ success: true, skins });
    } catch (err) {
        console.error('Error al obtener inventario global:', err);
        res.status(500).json({ success: false, message: 'Error al recuperar inventario.' });
    }
};
