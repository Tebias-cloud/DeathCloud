const { Pool } = require('pg');
const p = new Pool({user:'diego',host:'192.168.50.24',password:'admin123',port:5432,database:'death_cloud_dev'});

async function run() {
  // 1. Table structure
  const cols = await p.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='games_catalog' ORDER BY ordinal_position`);
  console.log('=== games_catalog columns ===');
  cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

  // 2. Check theme format for LoL specifically
  const lol = await p.query(`SELECT id, theme, assets FROM games_catalog WHERE id='league-of-legends'`);
  console.log('\n=== LoL data ===');
  console.log(JSON.stringify(lol.rows[0], null, 2));

  // 3. Check all schemas  
  const schemas = await p.query(`SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast','public') ORDER BY schema_name`);
  console.log('\n=== Schemas ===');
  console.log(schemas.rows.map(x => x.schema_name));

  // 4. Check if there's a schema_name column in games_catalog
  const hasSchema = cols.rows.find(r => r.column_name === 'schema_name');
  console.log('\n=== Has schema_name column? ===', !!hasSchema);

  p.end();
}
run().catch(e => { console.error(e); p.end(); });
