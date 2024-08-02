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

// Start the HTTPS server
httpsServer.listen(3000, () => {
  console.log('HTTPS Server running on port 443');
});