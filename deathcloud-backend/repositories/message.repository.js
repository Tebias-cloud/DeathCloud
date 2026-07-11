const pool = require('../config/db');

class MessageRepository {
  /**
   * Guarda un mensaje privado en la base de datos
   */
  async saveMessage(senderId, receiverId, content) {
    const query = `
      INSERT INTO mensajes_privados (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, sender_id, receiver_id, content, created_at
    `;
    const result = await pool.query(query, [senderId, receiverId, content]);
    return result.rows[0];
  }

  /**
   * Obtiene el historial de mensajes entre dos usuarios (últimos 50 mensajes, por ejemplo)
   */
  async getChatHistory(userId1, userId2, limit = 50) {
    const query = `
      SELECT id, sender_id, receiver_id, content, created_at
      FROM mensajes_privados
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
      LIMIT $3
    `;
    const result = await pool.query(query, [userId1, userId2, limit]);
    return result.rows;
  }

  /**
   * Elimina los mensajes que tienen más de 24 horas de antigüedad
   */
  async deleteExpiredMessages() {
    const queryPrivados = `
      DELETE FROM mensajes_privados
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `;
    const resultPrivados = await pool.query(queryPrivados);

    const queryGlobales = `
      DELETE FROM mensajes
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `;
    const resultGlobales = await pool.query(queryGlobales);

    return { 
      privados: resultPrivados.rowCount, 
      globales: resultGlobales.rowCount 
    };
  }
}

module.exports = new MessageRepository();
