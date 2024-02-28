const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
const PORT = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//connect mongoose to mongoDB
mongoose = require('mongoose')
const uri = process.env.DB_URI
mongoose.Promise = global.Promise
mongoose.connect(uri)

//add route
var route = require('./routes.js')
app.use('/', route);



app.listen(PORT, (error) =>{ 
    if(!error) 
        console.log("Server is Successfully Running http://localhost:"+ PORT) 
    else 
        console.log("Error occurred, server can't start", error)
    } 
); 
