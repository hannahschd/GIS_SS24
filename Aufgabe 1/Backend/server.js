// Importieren der benötigten Module
const http = require('http'); // Modul für die Erstellung eines HTTP-Servers
const url = require('url'); // Modul zum Parsen von URL-Strings
const sqlite3 = require('sqlite3').verbose(); // Modul für die Verwendung der SQLite-Datenbank

const hostname = '127.0.0.1'; // Der Hostname, auf dem der Server laufen wird
const port = 3000; // Der Port, auf dem der Server laufen wird

// Verbindung zur SQLite-Datenbank herstellen
const db = new sqlite3.Database('./myDatabase.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Tabelle für Detaildaten erstellen, falls sie noch nicht existiert
db.run(`
  CREATE TABLE IF NOT EXISTS details (
    wish TEXT PRIMARY KEY,
    marke TEXT,
    link TEXT,
    datum TEXT,
    rank INTEGER
  )
`, (err) => {
  if (err) {
    console.error('Error creating details table', err);
  }
});

// Tabelle für die Rangliste erstellen, falls sie noch nicht existiert
db.run(`
  CREATE TABLE IF NOT EXISTS rankList (
    wish TEXT PRIMARY KEY,
    marke TEXT,
    link TEXT,
    datum TEXT,
    rank INTEGER
  )
`, (err) => {
  if (err) {
    console.error('Error creating rankList table', err);
  }
});

// Erstellen des HTTP-Servers
const server = http.createServer((request, response) => {
  // Setzen der Header für CORS und den Content-Typ
  response.setHeader('Access-Control-Allow-Origin', '*'); // CORS-Einstellungen
  response.setHeader('Content-Type', 'application/json'); // Content-Typ als JSON
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Erlaubte Header

  // Parsen der URL
  const parsedUrl = url.parse(request.url, true);
  const { pathname, query } = parsedUrl;

  // POST-Anfrage zum Hinzufügen von Detaildaten
  if (request.method === 'POST' && pathname === '/wishes') {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      try {
        const detailData = JSON.parse(body);

        // Detaildaten in der Datenbank speichern
        db.run(`
          INSERT OR REPLACE INTO details (wish, marke, link, datum, rank)
          VALUES (?, ?, ?, ?, ?)
        `, [detailData.wish, detailData.marke, detailData.link, detailData.datum, detailData.rank], (err) => {
          if (err) {
            console.error('Error inserting detail data', err);
            response.statusCode = 500;
            response.end('Database error');
          } else {
            console.log('Received detail:', detailData);
            response.statusCode = 200;
            response.end('Detail received');
          }
        });
      } catch (error) {
        console.error('Invalid JSON', error);
        response.statusCode = 400;
        response.end('Invalid JSON');
      }
    });

  // DELETE-Anfrage zum Löschen von Detaildaten
  } else if (request.method === 'DELETE' && pathname === '/wishes') {
    const { wish } = query;
    if (wish) {

      // Detaildaten aus der Datenbank löschen
      db.run(`DELETE FROM wishes WHERE wish = ?`, [wish], (err) => {
        if (err) {
          console.error('Error deleting wish', err);
          response.statusCode = 500;
          response.end('Database error');
        } else {
          response.statusCode = 200;
          response.end('Detail deleted');
        }
      });
    } else {
      response.statusCode = 404;
      response.end('Detail not found');
    }

  // GET-Anfrage zum Abrufen von Detaildaten
  } else if (request.method === 'GET' && pathname === '/details') {
    const { wish } = query;
    if (wish) {
      // Detaildaten aus der Datenbank abrufen
      db.get(`SELECT * FROM wishes WHERE wish = ?`, [wish], (err, row) => {
        if (err) {
          console.error('Error fetching wish', err);
          response.statusCode = 500;
          response.end('Database error');
        } else if (row) {
          response.statusCode = 200;
          response.end(JSON.stringify(row));
        } else {
          response.statusCode = 404;
          response.end('wish not found');
        }
      });
    } else {
      response.statusCode = 404;
      response.end('wish not found');
    }

  // POST-Anfrage zum Aktualisieren der Rangliste
  } else if (request.method === 'POST' && pathname === '/rankList') {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      try {
        const rankList = JSON.parse(body);
        db.serialize(() => {

          // Alte Rangliste löschen
          db.run(`DELETE FROM rankList`, (err) => {
            if (err) {
              console.error('Error deleting rankList', err);
              response.statusCode = 500;
              response.end('Database error');
              return;
            }

            // Neue Rangliste einfügen
            const stmt = db.prepare(`
              INSERT INTO rankList (wish, marke, link, datum, rank)
              VALUES (?, ?, ?, ?, ?)
            `);
            rankList.forEach(item => {
              stmt.run(item.wish, item.marke, item.link, item.datum, item.rank, (err) => {
                if (err) {
                  console.error('Error inserting rankList item', err);
                }
              });
            });

            stmt.finalize((err) => {
              if (err) {
                console.error('Error finalizing statement', err);
                response.statusCode = 500;
                response.end('Database error');
              } else {
                console.log('Received rankList:', rankList);
                response.statusCode = 200;
                response.end('RankList received');
              }
            });
          });
        });
      } catch (error) {
        console.error('Invalid JSON', error);
        response.statusCode = 400;
        response.end('Invalid JSON');
      }
    });

  // GET-Anfrage zum Abrufen der Rangliste
  } else if (request.method === 'GET' && pathname === '/rankList') {
    
    // Rangliste aus der Datenbank abrufen
    db.all(`SELECT * FROM rankList ORDER BY rank`, [], (err, rows) => {
      if (err) {
        console.error('Error fetching rankList', err);
        response.statusCode = 500;
        response.end('Database error');
      } else {
        response.statusCode = 200;
        response.end(JSON.stringify(rows));
      }
    });

  // OPTIONS-Anfrage für CORS-Preflight-Anfragen
  } else if(request.method === 'OPTIONS'){
      response.statusCode = 200;
      response.end();

  } else {
    response.statusCode = 404;
    response.end('Not Found');
  }
});

// Starten des Servers
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

   