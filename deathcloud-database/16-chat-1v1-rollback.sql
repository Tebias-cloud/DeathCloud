-- Script de reversión para el Chat 1v1 Efímero (Sprint 3)
-- Eliminar índices creados
DROP INDEX IF EXISTS idx_mensajes_privados_conversation;
DROP INDEX IF EXISTS idx_mensajes_privados_created_at;

-- Eliminar tabla
DROP TABLE IF EXISTS mensajes_privados;
