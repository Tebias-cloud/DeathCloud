-- Script de migración para las Sesiones Activas (Analíticas de Usuarios)
-- Sprint 3: Esta tabla permite registrar cada sesión de usuario (IP, User Agent, Token)
-- para construir los gráficos de horas pico y métricas de seguridad.

CREATE TABLE IF NOT EXISTS sesiones_activas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indice para optimizar consultas de horas pico por fecha de creación
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_fecha 
ON sesiones_activas(fecha_creacion);

-- Indice para búsquedas rápidas de sesiones por usuario
CREATE INDEX IF NOT EXISTS idx_sesiones_activas_usuario 
ON sesiones_activas(usuario_id);
