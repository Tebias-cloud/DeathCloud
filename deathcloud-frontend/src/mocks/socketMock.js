// Emulador cliente de Socket.io para la demo estática

class MockSocket {
  constructor(namespace) {
    this.namespace = namespace;
    this.callbacks = {};
    this.isConnected = true;
    this.chatbotTimer = null;
    this.activeFriendId = null;
    this.userId = null;

    // Conectar y simular eventos de inicio
    setTimeout(() => {
      this._triggerConnect();
    }, 100);
  }

  _triggerConnect() {
    if (!this.isConnected) return;

    if (this.namespace === 'public') {
      // Enviar historial de chat global de inmediato
      const history = JSON.parse(localStorage.getItem('dc_chat_history')) || [];
      this._emitToSelf('historial_mensajes', history);
      
      // Iniciar el generador de mensajes del chat global (chatbot)
      this._startPublicChatBot();
    }
  }

  // Suscribirse a eventos
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
    return this;
  }

  // Cancelar suscripción
  off(event, callback) {
    if (this.callbacks[event]) {
      if (callback) {
        this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
      } else {
        delete this.callbacks[event];
      }
    }
    return this;
  }

  // Emitir eventos al "servidor"
  emit(event, data) {
    if (!this.isConnected) return;

    console.log(`[Mock Socket Emit] Namespace: ${this.namespace}, Event: ${event}`, data);

    if (this.namespace === 'public') {
      if (event === 'enviar_mensaje') {
        const history = JSON.parse(localStorage.getItem('dc_chat_history')) || [];
        const newMsg = {
          usuario: data.usuario || 'Anónimo',
          texto: data.texto,
          hora: data.hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        history.push(newMsg);
        
        // Mantener solo los últimos 100 mensajes en memoria local
        if (history.length > 100) history.shift();
        localStorage.setItem('dc_chat_history', JSON.stringify(history));

        // Retransmitir a todos los listeners activos de chat publico
        setTimeout(() => {
          this._broadcastGlobal('recibir_mensaje', newMsg);
        }, 50);
      }
    } 
    
    else if (this.namespace === 'private') {
      if (event === 'authenticate') {
        this.userId = data;
        console.log(`[Mock Private Socket] Authenticated user ID: ${this.userId}`);
      } 
      
      else if (event === 'load_history') {
        this.activeFriendId = data.friendId;
        this._loadPrivateChatHistory();
      } 
      
      else if (event === 'send_private_message') {
        this._sendPrivateMessage(data.receiverId, data.content);
      }
    }

    return this;
  }

  disconnect() {
    this.isConnected = false;
    if (this.chatbotTimer) {
      clearInterval(this.chatbotTimer);
    }
    // Remover esta instancia de la lista de sockets activos
    activeSockets = activeSockets.filter(s => s !== this);
    console.log(`[Mock Socket Disconnect] Namespace: ${this.namespace}`);
  }

  // --- MÉTODOS INTERNOS Y SIMULACIONES ---

  _emitToSelf(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }

  _broadcastGlobal(event, data) {
    activeSockets.forEach(socket => {
      if (socket.namespace === this.namespace && socket.isConnected) {
        socket._emitToSelf(event, data);
      }
    });
  }

  // Chatbot global para simular actividad
  _startPublicChatBot() {
    const chatBotPhrases = [
      '¿Alguien para una partida rápida en 2D Shooter?',
      'Se cayó el servidor de Nginx temporalmente o soy yo?',
      'Acabo de desbloquear el logro legendario del Sector 7',
      'Traje Tóxico es la mejor skin por lejos',
      '¿Quién es el top 1 en Toxic Skies hoy?',
      'Agreguen para clasificar juntos.',
      'Hola! Acabo de registrarme en la terminal de DeathCloud.',
      'Soportes resueltos al instante por la administración, increíble.',
      'Recomiendo ahorrar E-Points para el Hacha Premium.',
      'Alguien sabe si van a meter más mapas?',
      '¡Qué buen soundtrack tiene DeathCloud Runner!',
      'Al fin pude superar mi récord anterior.'
    ];

    const chatBotUsers = ['ShadowFang', 'LunaMist', 'CyberNinja', 'GoldenEye', 'NeonSamurai', 'VoidWalker', 'PlasmaBurn'];

    this.chatbotTimer = setInterval(() => {
      if (!this.isConnected) return;
      
      const randomUser = chatBotUsers[Math.floor(Math.random() * chatBotUsers.length)];
      const randomText = chatBotPhrases[Math.floor(Math.random() * chatBotPhrases.length)];
      const hour = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg = {
        usuario: randomUser,
        texto: randomText,
        hora: hour
      };

      // Guardar en base de datos local
      const history = JSON.parse(localStorage.getItem('dc_chat_history')) || [];
      history.push(newMsg);
      if (history.length > 100) history.shift();
      localStorage.setItem('dc_chat_history', JSON.stringify(history));

      // Emitir en el chat global
      this._broadcastGlobal('recibir_mensaje', newMsg);
    }, 25000); // Enviar mensaje cada 25 segundos para mantenerlo activo pero no invasivo
  }

  // Carga del historial privado
  _loadPrivateChatHistory() {
    const history = JSON.parse(localStorage.getItem('dc_private_messages')) || [];
    const filtered = history.filter(m => 
      (m.sender_id === this.userId && m.receiver_id === this.activeFriendId) ||
      (m.sender_id === this.activeFriendId && m.receiver_id === this.userId)
    );
    this._emitToSelf('chat_history', { history: filtered });
  }

  // Envío de mensaje privado
  _sendPrivateMessage(receiverId, content) {
    const history = JSON.parse(localStorage.getItem('dc_private_messages')) || [];
    const newMsg = {
      id: Date.now(),
      sender_id: this.userId,
      receiver_id: receiverId,
      content,
      created_at: new Date().toISOString()
    };
    history.push(newMsg);
    localStorage.setItem('dc_private_messages', JSON.stringify(history));

    // Retransmitir al emisor (confirmación en su panel)
    this._emitToSelf('receive_private_message', newMsg);

    // Retransmitir al receptor en todas las sockets privadas activas que correspondan
    activeSockets.forEach((socket) => {
      if (socket.namespace === 'private' && socket.userId === receiverId && socket.isConnected) {
        socket._emitToSelf('receive_private_message', newMsg);
      }
    });

    // Simular respuesta automática del amigo (Chatbot Privado)
    this._simulatePrivateChatbotReply(receiverId);
  }

  _simulatePrivateChatbotReply(friendId) {
    const users = JSON.parse(localStorage.getItem('dc_users')) || [];
    const friend = users.find(u => u.id === friendId);
    if (!friend) return;

    const replies = [
      '¡Hola! Qué bien, me conecto en un rato y jugamos.',
      'Jajaja, ¡buena partida! Estuvo cerca.',
      'Estoy terminando de cenar y me sumo.',
      'Dale, nos vemos en el Hub del Sector.',
      '¿Viste las nuevas actualizaciones del foro?',
      'Oye, mándame solicitud de nuevo si no te tengo.',
      '¡Genial! Hablamos en un momento.',
      'Claro bro, voy de camino al refugio.'
    ];

    setTimeout(() => {
      if (!this.isConnected || this.activeFriendId !== friendId) return;

      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const history = JSON.parse(localStorage.getItem('dc_private_messages')) || [];
      
      const newMsg = {
        id: Date.now() + 1,
        sender_id: friendId,
        receiver_id: this.userId,
        content: randomReply,
        created_at: new Date().toISOString()
      };

      history.push(newMsg);
      localStorage.setItem('dc_private_messages', JSON.stringify(history));

      // Emitir al emisor de la respuesta (y receptor en la vista)
      this._emitToSelf('receive_private_message', newMsg);
      
      // Dispatch custom event so layouts (like Header badges) know there is a new message
      const eventDetail = {
        sender_id: friendId,
        receiver_id: this.userId,
        content: randomReply,
        senderName: friend.nickname || friend.nombre_usuario
      };
      window.dispatchEvent(new CustomEvent('new_private_message', { detail: eventDetail }));
      
    }, 2000); // 2 segundos de retraso para simular escritura humana
  }
}

// Lista global de sockets activas en la aplicación
let activeSockets = [];

export const io = (url) => {
  const isPrivate = typeof url === 'string' && url.includes('/chat');
  const namespace = isPrivate ? 'private' : 'public';
  
  const socket = new MockSocket(namespace);
  activeSockets.push(socket);
  return socket;
};

export default io;
