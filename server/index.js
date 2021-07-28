const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const http = require('http');
// const https = require('https');
// const fs = require('fs');
var os = require("os");
var host = os.hostname();

//Routes file
const CategoryRouter = require('./routers/Category')

//Environment variable
require('dotenv').config()

//Server setup
const app = express()
const PORT = process.env.PORT || 3001

//Middlewares
app.use(cors())
app.use(bodyParser.json())

//Database connection
require('./db/Mongoose')

//Routes middleware
app.use(CategoryRouter)

// const options = {
//     key: fs.readFileSync(`${__dirname}/key.pem`),
//     cert: fs.readFileSync(`${__dirname}/cert.pem`)
// };

// Create an HTTP service.
http.createServer(app).listen(PORT, () => {
    console.log(`Server is running on ${host}:${PORT}`)
});

// Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(PORT, () => {
//     // app.enable('trust proxy');
//     console.log(`Server is running on ${host}:${PORT}`)
// });