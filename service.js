// Hintergrunddienst des Homescreens. Läuft im TizenBrew-Service (Node 4, ES5!).
// Grund: Die Homescreen-Seite selbst hat keinen Zugriff auf tizen.application,
// der Dienst schon. Die Seite ruft http://127.0.0.1:8095/launch?id=<App-ID> auf.
var http = require('http');
var url = require('url');

function reply(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

var server = http.createServer(function (req, res) {
  var u = url.parse(req.url, true);
  if (u.pathname === '/launch' && u.query.id) {
    try {
      tizen.application.launch(u.query.id,
        function () { reply(res, { ok: true }); },
        function (e) { reply(res, { ok: false, error: e.name + ': ' + e.message }); });
    } catch (e) {
      reply(res, { ok: false, error: String(e) });
    }
    return;
  }
  reply(res, { ok: true, service: 'tv-home' });
});

// Läuft der Dienst schon (Modul erneut gestartet), ist der Port belegt – dann einfach still bleiben.
// Lauscht im Heimnetz statt nur lokal, damit man vom Laptop prüfen kann, ob er läuft.
server.on('error', function () {});
server.listen(8095, '0.0.0.0');
