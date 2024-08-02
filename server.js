const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Logging middleware
function logRequests(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}

// Load SSL/TLS certificates
const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/parlazyapi.cameronharris.dev/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/parlazyapi.cameronharris.dev/fullchain.pem')
};

app.use(logRequests);

// Add routes
var route = require('./routes.js');
app.use('/', route);

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Create HTTPS server
https.createServer(sslOptions, app).listen(port, () => {
    console.log(`HTTPS server is running at https://parlazyapi.cameronharris.dev:${port}`);
});