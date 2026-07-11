const chatService = require('../services/chat.service');

// Mapa para mantener la relación entre el ID del usuario y su Socket ID
// Idealmente en producción esto podría vivir en Redis
const connectedUsers = new Map();

const chatSocketHandler = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log('🟢 Nuevo usuario conectado al chat 1v1');

    // Autenticación básica (el frontend debe emitir esto al conectar)
    socket.on('authenticate', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`Usuario ${userId} autenticado en el socket ${socket.id}`);
    });

    // Cargar el historial de un chat con un amigo
    socket.on('load_history', async (data) => {
      try {
        const { friendId } = data;
        const senderId = socket.userId;
        
        if (!senderId) return socket.emit('chat_error', { message: 'No estás autenticado en el socket.' });

        const history = await chatService.getChatHistory(senderId, friendId);
        socket.emit('chat_history', { friendId, history });
      } catch (error) {
        socket.emit('chat_error', { message: error.message });
      }
    });

    // Enviar un mensaje privado
    socket.on('send_private_message', async (data) => {
      try {
        const { receiverId, content } = data;
        const senderId = socket.userId;

        if (!senderId) {
          return socket.emit('chat_error', { message: 'No estás autenticado en el socket.' });
        }

        // Lógica de negocio (Valida amistad y guarda)
        const savedMessage = await chatService.sendMessage(senderId, receiverId, content);

        // Si se guardó correctamente, enviarlo al emisor para confirmación
        socket.emit('receive_private_message', savedMessage);

        // Si el receptor está conectado, enviarle el mensaje en tiempo real
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          chatNamespace.to(receiverSocketId).emit('receive_private_message', savedMessage);
        }

      } catch (error) {
        // Retornar error al emisor si falla (ej. no son amigos)
        socket.emit('chat_error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`🔴 Usuario ${socket.userId} desconectado del chat`);
      }
    });
  });
};

module.exports = chatSocketHandler;
