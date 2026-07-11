const pool = require('./config/db');

async function checkAll() {
  // Check games_catalog columns
  const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'games_catalog'");
  console.log('games_catalog cols:', cols.rows.map(r => r.column_name).join(', '));
  
  // Check games data
  const games = await pool.query('SELECT id, displayname FROM games_catalog LIMIT 5');
  console.log('games_catalog rows:', JSON.stringify(games.rows));
  
  // Check news_articles
  const news = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'news_articles'");
  console.log('news_articles cols:', news.rows.map(r => r.column_name).join(', '));
  
  // Check community news error
  const newsData = await pool.query('SELECT * FROM news_articles LIMIT 3');
  console.log('news sample:', JSON.stringify(newsData.rows));
  
  pool.end();
}

checkAll().catch(e => { console.error('ERROR:', e.message); pool.end(); });
