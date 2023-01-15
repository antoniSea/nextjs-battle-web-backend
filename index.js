const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const port = 3000;
const path = require('path');
const mustacheExpress = require('mustache-express');

const db = require('./db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'text/html' }));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'templates'));

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS battle_info (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)');
});

app.get('/', (req, res) => {
  db.all('SELECT * FROM battle_info', (err, rows) => {
    res.send(rows) 
  });
}) 

app.post('/create-battle-info', (req, res) => {
  db.run('INSERT INTO battle_info (data) VALUES (?)', req.body.data, (err) => {
    if (err) {
      res.send(err);
    }

    db.get('SELECT last_insert_rowid() as id', (err, row) => {
      if (err) {
        res.send(err);
      }
      res.send(row);
    });
  });
})

app.get('/battle-info/:id', (req, res) => {
  db.get('SELECT * FROM battle_info WHERE id = ?', req.params.id, (err, row) => {
    if (err) {
      res.send(err);
    }

    // render showBattleInfo template with row
    res.render('showBattleInfo', { battleInfo: row });
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
