const { Pool } = require('pg');
const p = new Pool({user:'diego',host:'192.168.50.24',password:'admin123',port:5432,database:'death_cloud_dev'});

async function run() {
  const orphans = ['game2d', 'new_test_game', 'runner', 'skies', 'test_game_1782917238599', 'test_game_1782917317618', 'vegeta', 'willyrex'];
  for (const s of orphans) {
    console.log('Dropping schema', s);
    await p.query(`DROP SCHEMA IF EXISTS "${s}" CASCADE`);
  }
  
  // Also fix League of Legends theme
  console.log('Fixing League of Legends theme...');
  await p.query(`UPDATE games_catalog SET theme = $1 WHERE id = 'league-of-legends'`, [JSON.stringify({"theme-neon": "#e100ff"})]);
  
  console.log('Done!');
  p.end();
}
run().catch(e => { console.error(e); p.end(); });
