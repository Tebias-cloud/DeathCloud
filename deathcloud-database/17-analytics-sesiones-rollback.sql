-- Script de reversión para las Sesiones Activas (Analíticas - Sprint 3)
-- Eliminar índices creados
DROP INDEX IF EXISTS idx_sesiones_activas_usuario;
DROP INDEX IF EXISTS idx_sesiones_activas_fecha;

-- Eliminar tabla
DROP TABLE IF EXISTS sesiones_activas;
