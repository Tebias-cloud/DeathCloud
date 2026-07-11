const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('pm2 logs back-dev --nostream --lines 20', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => { conn.end(); process.exit(code); })
          .on('data', (d) => process.stdout.write(d.toString()))
          .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).connect({
  host: "192.168.50.24", 
  port: 22, 
  username: "icin", 
  password: "Icin2026"
});
