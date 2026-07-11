const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: process.argv[2] || '.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME || 'death_cloud_prod',
  connectionTimeoutMillis: 8000
});

async function run() {
  console.log(`Llenando base de datos: ${process.env.DB_NAME || 'death_cloud_prod'}`);

  const defaultHash = await bcrypt.hash('player123', 10);

  // 1. Insertar 15 usuarios ficticios de forma segura (ON CONFLICT DO NOTHING)
  console.log('-> Insertando usuarios ficticios...');
  const fakeUsers = [
    { n: 'ShadowFang', e: 'shadow@test.com' }, { n: 'LunaMist', e: 'luna@test.com' },
    { n: 'CyberNinja', e: 'cyber@test.com' }, { n: 'GhostRider', e: 'ghost@test.com' },
    { n: 'NeonSamurai', e: 'neon@test.com' }, { n: 'PlasmaBurn', e: 'plasma@test.com' },
    { n: 'VoidWalker', e: 'void@test.com' }, { n: 'StellarFox', e: 'stellar@test.com' },
    { n: 'QuantumLeap', e: 'quantum@test.com' }, { n: 'MechaKing', e: 'mecha@test.com' },
    { n: 'PixelKnight', e: 'pixel@test.com' }, { n: 'DarkMage', e: 'dark@test.com' },
    { n: 'IronClad', e: 'iron@test.com' }, { n: 'SilverBullet', e: 'silver@test.com' },
    { n: 'GoldenEye', e: 'golden@test.com' }
  ];

  for (let u of fakeUsers) {
    await pool.query(
      `INSERT INTO usuarios (nombre_usuario, nickname, email, clave_encriptada, rol) 
       VALUES ($1, $2, $3, $4, 'user') ON CONFLICT (nombre_usuario) DO NOTHING`,
      [u.n, u.n, u.e, defaultHash]
    );
  }

  // Obtener IDs de usuarios recién insertados o existentes
  const usersRes = await pool.query(`SELECT id FROM usuarios WHERE rol = 'user' LIMIT 15`);
  const userIds = usersRes.rows.map(r => r.id);

  if (userIds.length > 1) {
    // 2. Insertar sesiones activas (simular horas de conexión)
    console.log('-> Insertando sesiones activas...');
    for (let i = 0; i < 8; i++) {
      const uid = userIds[i % userIds.length];
      await pool.query(
        `INSERT INTO sesiones_activas (usuario_id, token, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4)`,
        [uid, `fake_token_${i}_${Date.now()}`, `192.168.1.${100 + i}`, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FakeAgent']
      );
    }

    // 3. Insertar mensajes privados (simular chat)
    console.log('-> Insertando mensajes privados...');
    const chatMessages = [
      "¡Hola! ¿Alguien para unas partidas de Runner?",
      "Yo me apunto en 5 minutos",
      "¡Acabo de conseguir la skin legendaria!",
      "Esa skin está rota bro, felicidades",
      "¿Han notado lag en el servidor hoy?",
      "Sí, a mí me sacó de una partida",
      "Agreguen para rankear en Toxic Skies",
      "Ya te mando soli",
      "gg wp",
      "Alguien sabe cuándo sale el próximo pase?",
      "Creo que la otra semana anuncian algo",
      "Tengo 5000 E-Points, qué me compro?",
      "El hacha premium sin duda"
    ];

    for (let i = 0; i < 30; i++) {
      const sender = userIds[Math.floor(Math.random() * userIds.length)];
      let receiver = userIds[Math.floor(Math.random() * userIds.length)];
      while (receiver === sender) receiver = userIds[Math.floor(Math.random() * userIds.length)];
      const msg = chatMessages[Math.floor(Math.random() * chatMessages.length)];

      await pool.query(
        `INSERT INTO mensajes_privados (sender_id, receiver_id, content) VALUES ($1, $2, $3)`,
        [sender, receiver, msg]
      );
    }

    // 4. Insertar amistades
    console.log('-> Insertando amistades...');
    for (let i = 0; i < 5; i++) {
      const u1 = userIds[i];
      const u2 = userIds[i + 1];
      try {
        await pool.query(
          `INSERT INTO amigos (usuario_id_envia, usuario_id_recibe, estado) VALUES ($1, $2, 'aceptado') 
           ON CONFLICT ON CONSTRAINT unique_solicitud_amistad DO NOTHING`,
          [u1, u2]
        );
      } catch (e) {
        // Ignorar si hay algún otro error de constraint
      }
    }

    // 5. Insertar Tickets
    console.log('-> Insertando tickets...');
    const tickets = [
      { u: userIds[0], t: 'Error de conexión', c: 'conexion', s: 'abierto' },
      { u: userIds[1], t: 'Problema con la tienda', c: 'tienda', s: 'en_progreso' },
      { u: userIds[2], t: 'Bug en el mapa 2', c: 'bug', s: 'resuelto' },
      { u: userIds[3], t: 'Sugerencia de modo de juego', c: 'sugerencia', s: 'abierto' }
    ];
    for (let t of tickets) {
      await pool.query(
        `INSERT INTO tickets (usuario_id, titulo, descripcion, categoria, estado) VALUES ($1, $2, $3, $4, $5)`,
        [t.u, t.t, 'Descripción de prueba automática', t.c, t.s]
      );
    }

    // 6. Crear tablas de analíticas de noticias si no existen
    console.log('-> Creando tablas news_likes y news_rates si no existen...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_likes (
        id SERIAL PRIMARY KEY,
        news_id VARCHAR(50) NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('like', 'dislike')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(news_id, usuario_id)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_rates (
        id SERIAL PRIMARY KEY,
        news_id VARCHAR(50) NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL,
        estrellas NUMERIC(2,1) NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(news_id, usuario_id)
      )
    `);

    // 7. Insertar likes y ratings falsos en las noticias existentes
    console.log('-> Insertando likes y ratings en noticias...');
    const newsRes = await pool.query(`SELECT id FROM news_articles WHERE status = 'published' LIMIT 20`);
    const newsIds = newsRes.rows.map(r => r.id);

    if (newsIds.length > 0) {
      await pool.query(`DELETE FROM news_likes`);
      await pool.query(`DELETE FROM news_rates`);

      let likeCount = 0;
      let rateCount = 0;

      for (let newsId of newsIds) {
        const shuffledUsers = [...userIds].sort(() => Math.random() - 0.5);
        const likeUsers = shuffledUsers.slice(0, Math.floor(Math.random() * 8) + 3);

        for (let uid of likeUsers) {
          const tipo = Math.random() > 0.25 ? 'like' : 'dislike';
          try {
            await pool.query(
              `INSERT INTO news_likes (news_id, usuario_id, tipo) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [newsId, uid, tipo]
            );
            likeCount++;
          } catch (e) { /* ignorar duplicados */ }
        }

        const rateUsers = shuffledUsers.slice(0, Math.floor(Math.random() * 6) + 2);
        for (let uid of rateUsers) {
          const estrellas = (Math.floor(Math.random() * 3) + 3);
          try {
            await pool.query(
              `INSERT INTO news_rates (news_id, usuario_id, estrellas) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [newsId, uid, estrellas]
            );
            rateCount++;
          } catch (e) { /* ignorar duplicados */ }
        }
      }
      console.log(`  ✅ ${likeCount} likes/dislikes y ${rateCount} ratings insertados en ${newsIds.length} noticias.`);
    } else {
      console.log('  ⚠️  No se encontraron noticias publicadas para insertar likes/ratings.');
    }
  }

  console.log('✅ Datos falsos insertados exitosamente.');
  await pool.end();
}

run().catch(console.error);
