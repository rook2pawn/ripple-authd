
/**
 * Module dependencies.
 */

var express = require('express')
  , api = require('./routes/api')
  , fs = require('fs')
  , path = require('path')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , config = require('./config');

var app = express();

app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

var server;
app.configure('development', function(){
  app.set('port', config.port || 3000);
  server = http.createServer(app);
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.set('port', config.port || 443);
  server = https.createServer({
    ca: fs.readFileSync(path.resolve(__dirname, 'ca.crt')),
    key: fs.readFileSync(path.resolve(__dirname, 'ssl.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl.crt'))
  }, app);
});

app.post('/api/sign', api.sign);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
