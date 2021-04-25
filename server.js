var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const routes = require('./api/routes');
var db = require('./api/daos/index');
var expressWinston = require('express-winston');
var winston = require('winston');

//Port on which server will run
const port = 4000;

var app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//Middleware which will log request
app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  }));
app.use('/', routes);
app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  })); 

//server started
app.listen(port);
console.log('Server started on port ' + port);
