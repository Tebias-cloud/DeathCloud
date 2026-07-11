const pool = require('../config/db');

class FriendRepository {
  /**
   * Verifica si dos usuarios son amigos (estado = 'aceptado')
   */
  async areFriends(userId1, userId2) {
    const query = `
      SELECT id FROM amigos
      WHERE estado = 'aceptado'
      AND (
        (usuario_id_envia = $1 AND usuario_id_recibe = $2)
        OR
        (usuario_id_envia = $2 AND usuario_id_recibe = $1)
      )
      LIMIT 1
    `;
    const result = await pool.query(query, [userId1, userId2]);
    return result.rows.length > 0;
  }

  async findUserByUsernameOrNickname(username) {
    const destUserResult = await pool.query(
        'SELECT id, nombre_usuario FROM usuarios WHERE nombre_usuario = $1 OR nickname = $1 LIMIT 1',
        [username]
    );
    return destUserResult.rows[0];
  }

  async checkExistingRequest(userId1, userId2) {
    const checkResult = await pool.query(
        'SELECT * FROM amigos WHERE (usuario_id_envia = $1 AND usuario_id_recibe = $2) OR (usuario_id_envia = $2 AND usuario_id_recibe = $1)',
        [userId1, userId2]
    );
    return checkResult.rows[0];
  }

  async createFriendRequest(senderId, receiverId) {
    const insertResult = await pool.query(
        'INSERT INTO amigos (usuario_id_envia, usuario_id_recibe, estado) VALUES ($1, $2, \'pendiente\') RETURNING id, usuario_id_envia, usuario_id_recibe, estado, fecha_solicitud',
        [senderId, receiverId]
    );
    return insertResult.rows[0];
  }

  async getAcceptedFriends(userId) {
    const friendsResult = await pool.query(
        `SELECT a.id as friendship_id, u.id as user_id, u.nombre_usuario, u.nickname, u.email, u.avatar_url, u.bio
         FROM amigos a
         JOIN usuarios u ON (u.id = a.usuario_id_envia OR u.id = a.usuario_id_recibe)
         WHERE (a.usuario_id_envia = $1 OR a.usuario_id_recibe = $1)
           AND a.estado = 'aceptado'
           AND u.id <> $1`,
        [userId]
    );
    return friendsResult.rows;
  }

  async getIncomingRequests(userId) {
    const incomingResult = await pool.query(
        `SELECT a.id as request_id, u.id as sender_id, u.nombre_usuario, u.nickname, u.avatar_url, a.fecha_solicitud
         FROM amigos a
         JOIN usuarios u ON u.id = a.usuario_id_envia
         WHERE a.usuario_id_recibe = $1 AND a.estado = 'pendiente'`,
        [userId]
    );
    return incomingResult.rows;
  }

  async getOutgoingRequests(userId) {
    const outgoingResult = await pool.query(
        `SELECT a.id as request_id, u.id as receiver_id, u.nombre_usuario, u.nickname, u.avatar_url, a.fecha_solicitud
         FROM amigos a
         JOIN usuarios u ON u.id = a.usuario_id_recibe
         WHERE a.usuario_id_envia = $1 AND a.estado = 'pendiente'`,
        [userId]
    );
    return outgoingResult.rows;
  }

  async acceptRequest(requestId, userId) {
    const updateResult = await pool.query(
        `UPDATE amigos 
         SET estado = 'aceptado', fecha_respuesta = CURRENT_TIMESTAMP 
         WHERE id = $1 AND usuario_id_recibe = $2 
         RETURNING id`,
        [requestId, userId]
    );
    return updateResult.rowCount > 0;
  }

  async deleteRequestOrFriend(requestId, userId) {
    const deleteResult = await pool.query(
        `DELETE FROM amigos 
         WHERE id = $1 AND (usuario_id_recibe = $2 OR usuario_id_envia = $2) 
         RETURNING id`,
        [requestId, userId]
    );
    return deleteResult.rowCount > 0;
  }
}

module.exports = new FriendRepository();
