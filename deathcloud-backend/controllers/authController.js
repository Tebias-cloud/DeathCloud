const authService = require('../services/auth.service');

// Registro de Usuario
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await authService.register(username, email, password);
        
        res.json({
            success: true,
            message: "Registro exitoso",
            user: result
        });
    } catch (err) {
        if (err.message === 'Todos los campos son obligatorios' || err.message === 'El usuario o email ya están registrados') {
            return res.status(400).json({ success: false, message: err.message });
        }
        console.error('Error en registro:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Login de Usuario
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Desconocido';

        const result = await authService.login(email, password, ip, userAgent);

        res.json({
            success: true,
            message: "Acceso concedido",
            ...result
        });
    } catch (err) {
        if (err.message === 'Debe ingresar su email y contraseña' || err.message === 'Credenciales inválidas') {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.message.startsWith('Transmisión rechazada')) {
            return res.status(403).json({ success: false, message: err.message });
        }
        console.error('Error en login:', err);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Obtener sesiones activas del usuario conectado
exports.getSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentToken = req.headers['authorization']?.split(' ')[1];
        
        const sessions = await authService.getSessions(userId, currentToken);
        res.json({ success: true, sessions });
    } catch (err) {
        console.error('Error al obtener sesiones:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Revocar una sesión específica del usuario conectado
exports.revokeSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        await authService.revokeSession(sessionId, userId);

        // Emitir un evento Socket.IO para forzar a los clientes a re-verificar su sesión
        const io = req.app.get('io');
        if (io) {
            io.emit('force_recheck_session', { userId: userId });
        }

        res.json({ success: true, message: 'Sesión revocada exitosamente.' });
    } catch (err) {
        if (err.message === 'Sesión no encontrada o no pertenece al usuario') {
            return res.status(404).json({ success: false, message: err.message });
        }
        console.error('Error al revocar sesión:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Cerrar sesión actual (elimina el token de sesiones_activas)
exports.logout = async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const userId = req.user.id;

        await authService.logout(token, userId);
        res.json({ success: true, message: 'Sesión cerrada correctamente.' });
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
        res.status(500).json({ success: false, message: 'Error interno al cerrar sesión.' });
    }
};