const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432
};

const mainDbName = process.env.DB_NAME || 'death_cloud_dev';

// Conexión principal para tablas compartidas (usuarios, mensajes, amigos, tickets)
const pool = new Pool({
  ...config,
  database: mainDbName
});

// Caché de pools específicos por juego
const gamePools = {};
const useFallbackSchema = {};

async function getGamePool(gameId) {
  // Normalizar el ID del juego para sufijo de DB / Esquema
  let dbSuffix = '';
  try {
    const res = await pool.query('SELECT schema_name FROM games_catalog WHERE id = $1', [gameId]);
    if (res.rows.length > 0 && res.rows[0].schema_name) {
      dbSuffix = res.rows[0].schema_name;
    } else {
      dbSuffix = gameId.replaceAll(/[^a-zA-Z0-9]/g, '_');
    }
  } catch (err) {
    console.error(`Error resolving schema for game ${gameId}:`, err);
    dbSuffix = gameId.replaceAll(/[^a-zA-Z0-9]/g, '_');
  }

  const gameDbName = `${mainDbName}_${dbSuffix}`;

  if (gamePools[gameId]) {
    return { 
      pool: gamePools[gameId], 
      schema: useFallbackSchema[gameId] ? dbSuffix : 'public', 
      isFallback: useFallbackSchema[gameId],
      dbName: useFallbackSchema[gameId] ? mainDbName : gameDbName
    };
  }

  // Intentar crear un pool independiente
  const tempPool = new Pool({
    ...config,
    database: gameDbName
  });

  try {
    const client = await tempPool.connect();
    client.release();
    console.log(`🔌 Conexión exitosa a la base de datos independiente del juego: ${gameDbName}`);
    gamePools[gameId] = tempPool;
    useFallbackSchema[gameId] = false;
    return { pool: tempPool, schema: 'public', isFallback: false, dbName: gameDbName };
  } catch (err) {
    console.log(`⚠️ No se pudo conectar a la base de datos "${gameDbName}": ${err.message}. Usando esquema de respaldo "${dbSuffix}".`);
    await tempPool.end().catch((e) => console.error('Error terminando pool temporal:', e.message));
    
    // Fallback: usar el pool principal con un esquema separado
    gamePools[gameId] = pool;
    useFallbackSchema[gameId] = true;
    return { pool: pool, schema: dbSuffix, isFallback: true, dbName: mainDbName };
  }
}

pool.getGamePool = getGamePool;

module.exports = pool;
