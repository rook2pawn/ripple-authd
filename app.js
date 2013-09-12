
/**
 * Module dependencies.
 */

var express = require('express')
  , api = require('./routes/api')
  , http = require('http')
  , path = require('path')
  , config = require('./config');

var app = express();

app.configure(function(){
  app.set('port', config.port || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/api/sign', api.sign);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
