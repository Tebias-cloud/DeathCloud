const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Apunta siempre a death_cloud_prod independientemente del .env
// Se lee desde .env para ser compatible tanto con dev como con prod
const PROD_DB = process.env.DB_NAME;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: PROD_DB,
  connectionTimeoutMillis: 8000
});

async function run() {
  console.log('🔌 Conectando a', process.env.DB_HOST, '/', PROD_DB);

  console.log('\n🧹 LIMPIANDO BASE DE DATOS (PROD)...');
  await pool.query(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);
        
  // Borrar tablas explícitamente en caso de que estén en otro esquema en el search_path
    
  console.log('  ✅ Base de datos vaciada.');

  const mainQueries = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      clave_encriptada VARCHAR(255) NOT NULL,
      rol VARCHAR(20) DEFAULT 'user',
      baneado BOOLEAN DEFAULT false,
      motivo_ban VARCHAR(255),
      avatar_url VARCHAR(255) DEFAULT 'none',
      bio VARCHAR(255) DEFAULT NULL,
      nickname VARCHAR(50),
      credits INT DEFAULT 2500,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(100) NOT NULL,
      texto TEXT NOT NULL,
      hora VARCHAR(50) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS mensajes_privados (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      receiver_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS amigos (
      id SERIAL PRIMARY KEY,
      usuario_id_envia INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      usuario_id_recibe INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptado', 'rechazado')),
      fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_respuesta TIMESTAMP DEFAULT NULL,
      CONSTRAINT unique_solicitud_amistad UNIQUE (usuario_id_envia, usuario_id_recibe),
      CONSTRAINT check_no_auto_amistad CHECK (usuario_id_envia <> usuario_id_recibe)
    )`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(100) NOT NULL,
      descripcion TEXT NOT NULL,
      categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('cuenta', 'bug', 'tienda', 'otro', 'conexion', 'pagos', 'recuperacion', 'reporte', 'sugerencia')),
      estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sesiones_activas (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL,
      ip_address VARCHAR(45) NOT NULL,
      user_agent VARCHAR(500) NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    // TABLAS PARA EL CATÁLOGO DINÁMICO
    `CREATE TABLE IF NOT EXISTS games_catalog (
      id VARCHAR(50) PRIMARY KEY,
      displayName VARCHAR(100) NOT NULL,
      tagline VARCHAR(255),
      subTagline VARCHAR(255),
      symbol VARCHAR(10),
      theme JSONB,
      assets JSONB
    )`,
    `CREATE TABLE IF NOT EXISTS store_items (
      id VARCHAR(50) PRIMARY KEY,
      game_id VARCHAR(50) REFERENCES games_catalog(id) ON DELETE CASCADE,
      title VARCHAR(100) NOT NULL,
      category VARCHAR(50) CHECK (category IN ('aspectos', 'armas', 'iconos', 'monturas', 'otro')),
      rarity VARCHAR(50) CHECK (rarity IN ('Común', 'Raro', 'Épico', 'Legendario')),
      rarityColor VARCHAR(50) CHECK (rarityColor IN ('text-theme-muted', 'text-[#f87171]', 'text-theme-neon', 'text-[#c084fc]')),
      description TEXT,
      image VARCHAR(255),
      price INT NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS news_articles (
      id VARCHAR(50) PRIMARY KEY,
      game_id VARCHAR(50) REFERENCES games_catalog(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      "desc" TEXT,
      date VARCHAR(100),
      image VARCHAR(255),
      status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published')),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  console.log('\n📋 CREANDO TABLAS ESTRUCTURALES...');
  for (let q of mainQueries) {
    await pool.query(q);
  }
  console.log('  ✅ Tablas principales y de catálogo creadas.');

  // Crear usuario admin
  const adminHash = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre_usuario, nickname, email, clave_encriptada, rol) 
     VALUES ($1, $2, $3, $4, $5)`,
    ['admin', 'AdminDC', 'admin@deathcloud.com', adminHash, 'admin']
  );
  console.log('\n👤 Usuario Admin creado: admin / admin123');

  // Insertar Juegos, Tienda y Noticias (semilla basada en gamesData.js original)
  console.log('\n🌱 SEMBRANDO CATÁLOGO DINÁMICO...');
  
  const gamesSeed = [
    {
      id: "deathcloud-runner",
      displayName: "DeathCloud Runner",
      tagline: "Un mundo. Un destino.",
      subTagline: "DeathCloud Runner",
      symbol: "DC",
      theme: {
        "theme-dark": "4 8 18",
        "theme-gradient-start": "13 27 42",
        "theme-panel": "rgba(10, 15, 30, 0.65)",
        "theme-neon": "0 243 255",
        "theme-neon-glow": "rgba(0, 243, 255, 0.5)",
        "theme-text": "224 242 254",
        "theme-muted": "125 211 252",
        "theme-success": "34 197 94"
      },
      assets: { heroBackground: "/assets/hero_bg.png", storePrimaryItem: "/assets/mech_shark.png", newsItem1: "/assets/premium_axe.png" }
    },
    {
      id: "deathcloud-toxic-skies",
      displayName: "DeathCloud Toxic Skies",
      tagline: "Sobrevive la lluvia ácida.",
      subTagline: "DeathCloud Toxic Skies",
      symbol: "TS",
      theme: {
        "theme-dark": "4 18 8",
        "theme-gradient-start": "13 42 20",
        "theme-panel": "rgba(10, 30, 15, 0.65)",
        "theme-neon": "34 197 94",
        "theme-neon-glow": "rgba(34, 197, 94, 0.5)",
        "theme-text": "220 252 231",
        "theme-muted": "74 222 128",
        "theme-success": "34 197 94"
      },
      assets: { heroBackground: "none", storePrimaryItem: "not-found", newsItem1: "not-found" }
    },
    {
      id: "deathcloud-2d",
      displayName: "DeathCloud 2D",
      tagline: "Aventura retro en plataforma.",
      subTagline: "DeathCloud 2D",
      symbol: "2D",
      theme: {
        "theme-dark": "18 8 4",
        "theme-gradient-start": "42 20 13",
        "theme-panel": "rgba(30, 15, 10, 0.65)",
        "theme-neon": "249 115 22",
        "theme-neon-glow": "rgba(249, 115, 22, 0.5)",
        "theme-text": "255 237 213",
        "theme-muted": "251 146 60",
        "theme-success": "34 197 94"
      },
      assets: { heroBackground: "none", storePrimaryItem: "not-found", newsItem1: "not-found" }
    }
  ];

  for (let g of gamesSeed) {
    await pool.query(
      `INSERT INTO games_catalog (id, displayName, tagline, subTagline, symbol, theme, assets) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [g.id, g.displayName, g.tagline, g.subTagline, g.symbol, JSON.stringify(g.theme), JSON.stringify(g.assets)]
    );
  }

  const storeItemsSeed = [
    { id: "skin-01", game_id: "deathcloud-runner", title: "Aspecto: Sombra Abisal", category: "aspectos", rarity: "Legendario", rarityColor: "text-[#c084fc]", description: "Viste a tu usuario con el manto de la tormenta de sombras. Incluye voz personalizada y efectos de partículas oscuras.", image: "/assets/hero_bg.png", price: 1500 },
    { id: "mount-01", game_id: "deathcloud-runner", title: "Montura: Tiburón Mecánico", category: "aspectos", rarity: "Épico", rarityColor: "text-theme-neon", description: "Surca los cielos cibernéticos de Death Cloud con un rastro de neón inigualable.", image: "/assets/mech_shark.png", price: 800 },
    { id: "weapon-01", game_id: "deathcloud-runner", title: "Hacha de Combate Premium", category: "armas", rarity: "Raro", rarityColor: "text-[#f87171]", description: "Un hacha forjada con el metal del núcleo. Otorga bonificaciones visuales críticas.", image: "/assets/premium_axe.png", price: 600 },
    { id: "icon-01", game_id: "deathcloud-runner", title: "Icono: Tiburón Mecánico", category: "iconos", rarity: "Común", rarityColor: "text-theme-muted", description: "Icono holográfico exclusivo del Tiburón Mecánico para tu perfil visible.", image: "/assets/mech_shark.png", price: 150 },
    { id: "icon-02", game_id: "deathcloud-runner", title: "Icono: Hacha Premium", category: "iconos", rarity: "Común", rarityColor: "text-theme-muted", description: "Icono holográfico exclusivo del Hacha Premium para tu perfil visible.", image: "/assets/premium_axe.png", price: 150 },
    { id: "toxic-skin-01", game_id: "deathcloud-toxic-skies", title: "Traje de Filtro Tóxico Élite", category: "aspectos", rarity: "Legendario", rarityColor: "text-theme-neon", description: "Traje con blindaje anticorrosión y máscara purificadora de neón verde.", image: "/assets/toxic_skin.png", price: 1200 },
    { id: "retro-skin-01", game_id: "deathcloud-2d", title: "Aspecto Retro Pixel 8-Bit", category: "aspectos", rarity: "Raro", rarityColor: "text-theme-neon", description: "Transforma tu modelo 3D en un sprite pixelado clásico de los 80.", image: "/assets/retro_skin.png", price: 450 }
  ];

  for (let s of storeItemsSeed) {
    await pool.query(
      `INSERT INTO store_items (id, game_id, title, category, rarity, rarityColor, description, image, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [s.id, s.game_id, s.title, s.category, s.rarity, s.rarityColor, s.description, s.image, s.price]
    );
  }

  const newsSeed = [
    { id: "news-1", game_id: "deathcloud-runner", title: "Torneo de Temporada: Death Cloud Cup", desc: "Inscríbete con tu equipo y compite por un pozo acumulado de 50,000 E-Points.", date: "Hace 2 horas", image: "/assets/hero_bg.png" },
    { id: "news-2", game_id: "deathcloud-runner", title: "Actualización 1.2.0", desc: "Nuevas armas legendarias y balance.", date: "Hace 1 día", image: "/assets/premium_axe.png" },
    { id: "toxic-news-1", game_id: "deathcloud-toxic-skies", title: "Temporada Tóxica Desplegada", desc: "El gas ha cubierto las zonas bajas. La altura otorga inmunidad temporal.", date: "Hace 1 día", image: "none" },
    { id: "retro-news-1", game_id: "deathcloud-2d", title: "Modo Arcade de Fin de Semana", desc: "Vuelve a jugar con vidas limitadas y multiplicadores de puntuación.", date: "Hace 3 días", image: "none" }
  ];

  for (let n of newsSeed) {
    await pool.query(
      `INSERT INTO news_articles (id, game_id, title, "desc", date, image) VALUES ($1, $2, $3, $4, $5, $6)`,
      [n.id, n.game_id, n.title, n.desc, n.date, n.image]
    );
  }
  console.log('  ✅ Catálogo insertado.');

  // Restablecer los esquemas de stats (ranking) para que no rompa el código existente
  const gamesSchema = ['runner', 'skies', 'game2d'];
  for (let s of gamesSchema) {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${s}"`);
    await pool.query(`CREATE TABLE IF NOT EXISTS "${s}".user_credits (usuario_id INT PRIMARY KEY, credits INT DEFAULT 2500)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS "${s}".user_skins (id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, skin_id VARCHAR(100) NOT NULL, fecha_adquisicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS "${s}".user_stats (usuario_id INT PRIMARY KEY, score VARCHAR(50) DEFAULT '0', fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    // Community forum tables
    await pool.query(`CREATE TABLE IF NOT EXISTS "${s}".community_posts (
      id SERIAL PRIMARY KEY,
      usuario_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS "${s}".community_replies (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES "${s}".community_posts(id) ON DELETE CASCADE,
      usuario_id INT NOT NULL,
      content TEXT NOT NULL,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  }
  
  // (Opcional) No poblaremos el leaderboard con fake users ya que el usuario pidió la DB vacía, 
  // pero el Ranking original de App.jsx lee de user_stats. Si un usuario juega, se crea su score.

  console.log('\n📦 TABLAS EN death_cloud_prod:');
  const tables = await pool.query(`
    SELECT schemaname, tablename FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog','information_schema')
    ORDER BY schemaname, tablename
  `);
  tables.rows.forEach(r => console.log(`  📄 ${r.schemaname}.${r.tablename}`));

  await pool.end();
  console.log('\n✅ PROD INICIALIZADA CORRECTAMENTE (LISTA PARA SERVER OFICIAL)');
}

run().catch(e => { console.error('❌ FATAL:', e.message); process.exit(1); });
