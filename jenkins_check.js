const url = 'http://192.168.50.28:8080/job/deathcloud-backend/lastBuild/consoleText';
const headers = new Headers();
headers.set('Authorization', 'Basic ' + Buffer.from('equipo5:equipo!\"#$').toString('base64'));

fetch(url, { headers })
  .then(res => res.text())
  .then(text => console.log(text.substring(Math.max(0, text.length - 2000))))
  .catch(err => console.error(err));
