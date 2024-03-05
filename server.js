const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
const PORT = 3000
const ADDR = "192.168.1.13"

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//connect mongoose to mongoDB
mongoose = require('mongoose')
const uri = process.env.DB_URI
mongoose.Promise = global.Promise
mongoose.connect(uri)


function logRequests(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}
  
app.use(logRequests);

//add route
var route = require('./routes.js')
app.use('/', route);

app.listen(PORT, ADDR, (error) =>{ 
    if(!error) 
        console.log("Server is Successfully Running On http:/"+ADDR+":"+ PORT) 
    else 
        console.log("Error occurred, server can't start", error)
    } 
); 
