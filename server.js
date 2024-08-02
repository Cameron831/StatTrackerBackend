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

// Read your certificate and key files
const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use(logRequests);

// Add routes
var route = require('./routes.js');
app.use('/', route);

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Create an HTTP server for redirecting to HTTPS
const httpApp = express();
httpApp.use((req, res, next) => {
  if (req.secure) {
    return next();
  }
  res.redirect(`https://${req.headers.host}${req.url}`);
});
const httpServer = http.createServer(httpApp);

httpServer.listen(3000, () => {
  console.log('HTTP Server running on port 80 and redirecting to HTTPS');
});

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
