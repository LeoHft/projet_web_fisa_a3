const express = require('express');
const app = express();
const cors = require('cors');
const https = require("https");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const { Task1 } = require('./models/images.model');
require('dotenv').config();


const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DATABASE_NAME,
} = process.env;

const mongoUrl= `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE_NAME}?authSource=admin`;

mongoose.connect(mongoUrl, { 
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  /*const img = new Task1({ user_id: 1, profile_picture: null }); // image:null valide ici
  await img.save();
  console.log('Image saved to MongoDB');*/
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});



const corsOptions = {
  origin: [
    'https://192.168.1.177:8443',
    'https://breezy.hofstetterlab.ovh'
  ],
  methods: ['GET','POST'],
  credentials: true
}
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const options = {
  key: fs.readFileSync('/var/www/ssl/private.key'),
  cert: fs.readFileSync('/var/www/ssl/certificate.crt')
};


require("./routes/images.routes.js")(app);


app.get('/api/images/', (req, res) => {
      res.send('Hello from our images test!')
})

// Create HTTPS server
https.createServer(options, app).listen(3443, () => {
  console.log('HTTPS backend listening on port 3443');
});