const express = require('express');
const app = express();
const cors = require('cors');
const https = require("https");
const fs = require("fs");


// Initialisation Base de données
const { Model } = require('objection');
const Knex = require('knex');

const knexConfig = require('./knexfile');
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);

Model.knex(knex);
const corsOptions = {
  origin: [
    'https://192.168.1.177:8443',
    'https://breezy.hofstetterlab.ovh'
  ],
  methods: ['GET','POST'],
  credentials: true
}
app.use(cors(corsOptions));
app.use(express.json());


const options = {
  key: fs.readFileSync('/var/www/ssl/private.key'),
  cert: fs.readFileSync('/var/www/ssl/certificate.crt')
};

require("./routes/messages.routes.js")(app);

app.get('/test', (req, res) => {
      res.send('Hello from our messages test!')
})


https.createServer(options, app).listen(3443, () => {
  console.log('HTTPS backend listening on port 3443');
});