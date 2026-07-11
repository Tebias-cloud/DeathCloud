const adminMiddleware = (req, res, next) => {
    // req.user has been populated by authMiddleware
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: "No autorizado. Sesión no válida." 
        });
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: "Acceso denegado. Se requieren privilegios de Administrador del Sistema." 
        });
    }

    next();
};

module.exports = adminMiddleware;
