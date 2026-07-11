const messageRepository = require('../repositories/message.repository');
const friendRepository = require('../repositories/friend.repository');

class ChatService {
  /**
   * Envía un mensaje si y solo si los usuarios son amigos
   */
  async sendMessage(senderId, receiverId, content) {
    if (!senderId || !receiverId || !content) {
      throw new Error('Faltan datos requeridos (senderId, receiverId, content).');
    }

    // 1. Validar si son amigos
    const areFriends = await friendRepository.areFriends(senderId, receiverId);
    if (!areFriends) {
      throw new Error('No puedes enviar mensajes a este usuario porque no son amigos.');
    }

    // 2. Guardar el mensaje si la validación es exitosa
    const savedMessage = await messageRepository.saveMessage(senderId, receiverId, content);
    return savedMessage;
  }

  /**
   * Obtiene el historial de chat validando primero la amistad
   */
  async getChatHistory(userId1, userId2) {
    const areFriends = await friendRepository.areFriends(userId1, userId2);
    if (!areFriends) {
      throw new Error('No tienes permiso para ver este chat.');
    }

    return await messageRepository.getChatHistory(userId1, userId2);
  }
}

module.exports = new ChatService();
