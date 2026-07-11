const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`);
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const app = express();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const pool = require('./config/db');
const { getGamePool } = pool;
const gameRoutes = require('./routes/gameRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const communityRoutes = require('./routes/communityRoutes');
const juegosRoutes = require('./routes/juegosRoutes');

app.use(cors({
  origin: function(origin, callback) {
    // Permitir peticiones sin origin (como herramientas locales) o cualquier origen
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'public', 'uploads'))); // Fix para que Nginx proxea las imágenes
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// --- ROUTES ---
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api', userRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api', gameRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/games', juegosRoutes);
app.use('/api/moderacion', require('./routes/moderationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Endpoint para obtener la versión del backend (rúbrica)
app.get('/api/version', (req, res) => {
  res.json({ version: require('./package.json').version });
});

// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
  res.send(`
    <body style="background: #09090b; color: #00d2ff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <h1>🚀 SERVIDOR DEATHCLOUD ACTIVO</h1>
      <p style="color: #fff; opacity: 0.8;">El backend está escuchando en el puerto 3000</p>
      <div style="border: 1px solid #00d2ff; padding: 10px; border-radius: 5px;">Socket.io: ONLINE</div>
      <p style="font-size: 0.8rem; margin-top: 20px; color: #555;">v2.0 - JWT Enabled</p>
    </body>
  `);
});

// --- CENTRALIZED ERROR HANDLING ---
const logger = require('./config/logger');
app.use((err, req, res, next) => {
  logger.error('❌ Error detectado en la petición:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Excepción no capturada (uncaughtException):', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada (unhandledRejection):', reason);
});

const server = http.createServer(app);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Importar y usar los handlers de WebSockets para el Chat Privado
const chatSocket = require('./sockets/chat.socket');
chatSocket(io);

// Hacer io accesible desde los controladores
app.set('io', io);

io.on('connection', async (socket) => {
  console.log('🟢 Nuevo Usuario detectado en la red');

  try {
    const result = await pool.query('SELECT usuario, texto, hora FROM mensajes ORDER BY id ASC LIMIT 100');
    socket.emit('historial_mensajes', result.rows);
  } catch (err) {
    console.error('Error al obtener el historial de mensajes:', err);
  }

  socket.on('enviar_mensaje', async (data) => {
    console.log(`✉️ Transmisión de [${data.usuario}]: ${data.texto}`);
    try {
      // 1. Guardar el nuevo mensaje
      await pool.query(
        'INSERT INTO mensajes (usuario, texto, hora) VALUES ($1, $2, $3)',
        [data.usuario, data.texto, data.hora || new Date().toLocaleTimeString()]
      );
      
      // 2. Limpieza automática: Mantener solo los últimos 1000 mensajes
      await pool.query(
        'DELETE FROM mensajes WHERE id NOT IN (SELECT id FROM mensajes ORDER BY id DESC LIMIT 1000)'
      );
      
      io.emit('recibir_mensaje', data);
    } catch (err) {
      console.error('Error al guardar o limpiar mensajes:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado');
  });
});

// --- DB INITIALIZATION ---
// La inicialización de la base de datos se ha movido a /deathcloud-database/setup_db.js
// para separar las responsabilidades y mejorar la estructuración.

// --- TAREAS EN SEGUNDO PLANO (CRON) ---
const startMessageCleanupJob = require('./cron/messageCleanup.job');
startMessageCleanupJob();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, '0.0.0.0', () => {
  console.log('-------------------------------------------');
  console.log(`🚀 DEATHCLOUD BACKEND [${ENV.toUpperCase()}]`);
  console.log(`📡 PUERTO: ${PORT}`);
  console.log(`📦 DB: ${process.env.DB_NAME || 'app_db'}`);
  console.log('-------------------------------------------');
});

module.exports = app;