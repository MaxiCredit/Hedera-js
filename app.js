var express = require('express');
var app = express();
var cors = require('cors');
var router = require('./router');
var fs = require('fs');
var http = require('http');
var https = require('https');
//var prKey = fs.readFileSync('', 'utf8');
//var certificate = fs.readFileSync('', 'utf8');

//var credentials = {key: prKey, cert: certificate};
/*
var whiteList = ['http://localhost:3001', 'http://localhost:3002'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    if (whiteList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions);
}
*/
var corsOptionsDelegate = {origin : true};
app.use(express.static('images'));
app.use(express.static('bootstrap'));
app.use(express.static('css'));
app.use(express.static('icons'));
app.use(express.static('scripts'));
//app.use(express.static('qr'));
app.set('view engine', 'pug');
app.set('views', './views')
app.use('/', cors(corsOptionsDelegate), router);

var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
//httpsServer.listen(443);
