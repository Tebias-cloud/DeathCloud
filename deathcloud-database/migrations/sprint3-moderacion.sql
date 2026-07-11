CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    comentario_id INT NOT NULL,
    usuario_reporta_id INT NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comentario_id) REFERENCES news_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_reporta_id) REFERENCES users(id) ON DELETE CASCADE
);