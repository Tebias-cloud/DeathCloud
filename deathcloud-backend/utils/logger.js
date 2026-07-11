const fs = require('node:fs');
const path = require('node:path');

const logDir = path.join(__dirname, '../logs');

// Asegurarse de que el directorio de logs exista
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'security.log');

/**
 * Registra eventos críticos de seguridad en el archivo security.log
 * @param {string} action - Acción realizada (ej. BAN, ROLE_CHANGE)
 * @param {string|number} adminId - ID del administrador que ejecuta la acción
 * @param {string|number} targetId - ID del usuario/ticket afectado
 * @param {string} details - Detalles adicionales del evento
 */
const logSecurityEvent = (action, adminId, targetId, details) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ACTION: ${action} | ADMIN_ID: ${adminId} | TARGET_ID: ${targetId} | DETAILS: ${details}\n`;
    
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Error al escribir en el log de seguridad:', err);
        }
    });
};

module.exports = {
    logSecurityEvent
};
