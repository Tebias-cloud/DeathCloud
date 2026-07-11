const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AuthResponseDto = require('../dtos/AuthDto');

class AuthService {
    async register(username, email, password) {
        if (!username || !email || !password) {
            throw new Error('Todos los campos son obligatorios');
        }

        const existingUsers = await userRepository.findByEmailOrUsername(email, username);
        if (existingUsers.length > 0) {
            throw new Error('El usuario o email ya están registrados');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await userRepository.create(username, email, passwordHash);
        return AuthResponseDto(newUser, null);
    }

    async login(email, password, ip, userAgent) {
        if (!email || !password) {
            throw new Error('Debe ingresar su email y contraseña');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        if (user.baneado) {
            throw new Error(`Transmisión rechazada. Tu cuenta ha sido suspendida. Motivo: ${user.motivo_ban || 'No especificado'}.`);
        }

        const validPassword = await bcrypt.compare(password, user.clave_encriptada);
        if (!validPassword) {
            throw new Error('Credenciales inválidas');
        }

        const token = jwt.sign(
            { id: user.id, username: user.nombre_usuario, rol: user.rol, baneado: user.baneado },
            process.env.JWT_SECRET || 'deathcloud-secret-key-2026',
            { expiresIn: '24h' }
        );

        await userRepository.createSession(user.id, token, ip, userAgent);
        return AuthResponseDto(user, token);
    }

    parseUserAgent(ua) {
        if (!ua) return { os: 'Desconocido', browser: 'Desconocido' };
        
        let os = 'Otro';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
        let browser = 'Otro';
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Chrome') && !ua.includes('Chromium')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';
    
        return { os, browser };
    }

    async getSessions(userId, currentToken) {
        const rows = await userRepository.getSessionsByUser(userId);
        return rows.map(row => {
            const parsed = this.parseUserAgent(row.user_agent);
            return {
                id: row.id,
                ip_address: row.ip_address,
                user_agent: row.user_agent,
                os: parsed.os,
                browser: parsed.browser,
                fecha_creacion: row.fecha_creacion,
                is_current: row.token === currentToken
            };
        });
    }

    async revokeSession(sessionId, userId) {
        const rowCount = await userRepository.revokeSession(sessionId, userId);
        if (rowCount === 0) {
            throw new Error('Sesión no encontrada o no pertenece al usuario');
        }
    }

    async logout(token, userId) {
        await userRepository.deleteSessionByToken(token, userId);
    }
}

module.exports = new AuthService();
