const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // connect to default db first
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432
  });

  try {
    await client.connect();
    console.log('🟢 Conectado con éxito a PostgreSQL (Base de datos predeterminada: postgres).');
    
    // Check if database 'death_cloud_dev' exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'death_cloud_dev'");
    if (res.rows.length === 0) {
      console.log("🛠️ Creando base de datos 'death_cloud_dev'...");
      await client.query("CREATE DATABASE death_cloud_dev");
      console.log("✅ ¡Base de datos 'death_cloud_dev' creada con éxito!");
    } else {
      console.log("ℹ️ La base de datos 'death_cloud_dev' ya existe en el sistema.");
    }
  } catch (err) {
    console.error('❌ Error de conexión o ejecución en PostgreSQL:', err.message);
  } finally {
    await client.end();
  }
}

main();
