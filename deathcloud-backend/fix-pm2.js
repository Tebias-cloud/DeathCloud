const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('echo "Icin2026" | sudo -S chown -R icin:icin ~/.pm2 && pm2 kill && cd /var/www/deathcloud/backend && pm2 start server.js --name back-dev', (err, stream) => {
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
