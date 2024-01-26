const express = require('express');
const app = express();
const port = 3000;

//add comment route
var route = require('./routes.js')
app.use('/', route);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
