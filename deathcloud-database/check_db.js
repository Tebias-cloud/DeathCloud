require('dotenv').config({ path: '.env.prod' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function checkDB() {
  try {
    const tables = ['usuarios', 'mensajes', 'games_catalog', 'store_items', 'news_items', 'tickets', 'amigos'];
    const report = {};

    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${table} LIMIT 5`);
        const countRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        report[table] = {
          count: parseInt(countRes.rows[0].count, 10),
          sample: res.rows
        };
      } catch (err) {
        report[table] = { error: err.message };
      }
    }

    console.log(JSON.stringify(report, null, 2));
  } catch (err) {
    console.error('Connection error', err);
  } finally {
    pool.end();
  }
}

checkDB();
