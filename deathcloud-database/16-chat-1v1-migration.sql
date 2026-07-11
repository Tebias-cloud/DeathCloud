-- Script de migración para el Chat 1v1 Efímero
-- Esta tabla permite guardar los mensajes privados entre amigos.
-- Un cronjob o evento se encargará de purgar los registros mayores a 24 horas.

CREATE TABLE IF NOT EXISTS mensajes_privados (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indice para facilitar las consultas por conversación y acelerar la eliminación del Cron Job
CREATE INDEX IF NOT EXISTS idx_mensajes_privados_conversation 
ON mensajes_privados(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_privados_created_at 
ON mensajes_privados(created_at);
