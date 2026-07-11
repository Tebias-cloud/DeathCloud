const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, message: "Acceso denegado. Token no proporcionado o es inválido." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        
        // Verificar si la sesión sigue activa (el token existe en sesiones_activas)
        const sessionCheck = await pool.query('SELECT id FROM sesiones_activas WHERE token = $1 AND usuario_id = $2', [token, verified.id]);
        if (sessionCheck.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Tu sesión fue cerrada, vuelve a loguearte" });
        }
        
        // Verificación en tiempo real contra la Base de Datos
        const userCheck = await pool.query('SELECT rol, baneado FROM usuarios WHERE id = $1', [verified.id]);
        
        if (userCheck.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Usuario no encontrado en el sistema." });
        }
        
        const dbUser = userCheck.rows[0];
        
        if (dbUser.baneado) {
            return res.status(403).json({ success: false, message: "Transmisión rechazada. Tu cuenta ha sido suspendida por un administrador." });
        }

        // Sobrescribir el objeto req.user con los datos frescos
        req.user = {
            ...verified,
            rol: dbUser.rol,
            baneado: dbUser.baneado
        };
        
        next();
    } catch (err) {
        console.error(`[AuthMiddleware] JWT Verify Error: ${err.message}. Token: ${token}`);
        res.status(403).json({ success: false, message: "Token inválido o expirado." });
    }
};

module.exports = authMiddleware;
