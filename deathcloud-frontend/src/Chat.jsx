import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';

const Chat = ({ onLogout }) => {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const getSocketUrl = () => {
            return (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
    };
    const newSocket = io(getSocketUrl());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    // 2. Escuchar evento desde el Backend cuando se retransmite un mensaje (de PC o Android)
    newSocket.on('recibir_mensaje', (data) => {
      // Tomamos el array de mensajes antiguos y le agregamos el nuevo con un id único para React
      const msgWithId = typeof data === 'string' ? { texto: data, _id: crypto.randomUUID() } : { ...data, _id: crypto.randomUUID() };
      setMensajes((prevMensajes) => [...prevMensajes, msgWithId]);
    });

    // 3. Cuando se cierra el componente (ej. cerrar sesión), nos desconectamos
    return () => newSocket.disconnect();
  }, []);

  const enviarMensaje = (e) => {
    e.preventDefault();
    // Validar que no manden vacío
    if (mensaje.trim() !== '' && socket) {
      // 4. Emitir el mensaje al Backend
      const usuario = localStorage.getItem('username') || 'Usuario Web';
      socket.emit('enviar_mensaje', { usuario: usuario, texto: mensaje });
      setMensaje(''); // Limpiar el input después de enviar
    }
  };

  return (
    <div className="main-wrapper">
      <h1 className="main-title">DEATHCLOUD NET</h1>

      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>COMMS GLOBALES</h2>
          <button onClick={onLogout} style={{ background: 'transparent', color: '#ff4e4e', border: '1px solid #ff4e4e', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron', textTransform: 'uppercase' }}>Desconectar</button>
        </div>
        
        <div className="chat-messages">
          {mensajes.map((msg, index) => (
            <div key={msg._id || index} className="chat-message">
              <strong>[{msg.usuario || 'Desconocido'}]:</strong> {msg.texto || msg}
            </div>
          ))}
          {mensajes.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: '100px' }}>Red vacía. Transmisión a la espera...</p>}
        </div>

        <form onSubmit={enviarMensaje} className="chat-input-wrapper">
          <input 
            type="text" 
            value={mensaje} 
            onChange={(e) => setMensaje(e.target.value)} 
            placeholder="Introduce tu mensaje..."
          />
          <button type="submit" className="btn-main">TRANSMITIR</button>
        </form>
      </div>
    </div>
  );
};

Chat.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Chat;
