const pool = require('./config/db');
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
  .then(r => { 
    console.log('TABLES:', r.rows.map(x=>x.table_name).join(', ')); 
    // Also check columns of compras
    return pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'compras'");
  })
  .then(r => { console.log('compras cols:', r.rows.map(x=>x.column_name).join(', ')); pool.end(); })
  .catch(e => { console.error('ERROR:', e.message); pool.end(); });
