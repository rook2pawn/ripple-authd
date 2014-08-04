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
  , config = require('./config')
  , Ddos= require('ddos');
var reporter = require('./lib/reporter')
var ddos = new Ddos;
var app = express();
var env = process.env.NODE_ENV || 'development';
var morgan  = require('morgan')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var errorhandler = require('errorhandler')
var cors = require('cors')

app.use(ddos.express);
app.use(reporter.inspect)
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.post('/api/sign', api.sign);
app.post('/api/test', api.test);

var server;
var protocol = 'http';
if (env === 'development') {
    app.set('port', config.port || 3000);
    server = http.createServer(app);
    app.use(errorhandler());
} else if (env === 'production') {
    protocol = 'https';
    app.set('port', config.port || 443);
    server = https.createServer({
    ca: fs.readFileSync(path.resolve(__dirname, 'ca.crt')),
    key: fs.readFileSync(path.resolve(__dirname, 'ssl.key')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl.crt'))
    }, app);
} else {
    app.set('port', 3000);
    server = http.createServer(app);
    app.use(errorhandler());
}

server.listen(app.get('port'), function(){
    console.log("Ripple authd listening on port " + app.get('port'));
});

var request = require('request')
/*
setInterval(function() {
    reporter.log("authd health test:posting", protocol, app.get('port'))
    request.post({url:protocol+'://localhost:'+app.get('port')+'/api/test',json:{info:'PAKDF_1_0_0:22:authd-test.example.com:8:stefanth:5:login:',signreq:'ae3f16904f6e34d48cb81a306c2ccba0f5eabffd8ea98cfadc6ed5e46bb64f6fe41ce72d81943223fb33c251d455196cd01ac3f64106a7d59b29d9a64ec63ccbe935b383ddff3fa0c4546fe0173b1b31da683b72a8c13eaaa0d7eff9fb23122032433159b825f7c5016ffd1d79c5a990ac4c08e309d5e325274d79acb5c83b2d64edfa00191ba05b51daae7a38f924b4f184d6b629f3983972d3c0ab41e425cf9c80e4e4fdaf1b2a9902ad25adaaea92d1dcdec10e6aab330addc77311eea81e410fe5ea58ed82f2dbacf66001ce5db95e225d28f2ced9e09e58dc924dc31121e42374d4503ea0c62a357346fdb3e260222253e8805e5c34aa00584308a1de68'}},
    function(err,resp,body) {
        if (resp.statusCode !== 200) {
            reporter.log('authd: test failure')
            reporter.log(resp.statusCode,resp.headers,body)
            process.exit()
        }
    })
}, 10000)
*/
process.on('SIGTERM',function() {
    reporter.log("caught sigterm");
    process.exit();
});
process.on('SIGINT',function() {
    reporter.log("caught sigint");
    process.exit();
});
process.on('exit',function() {
    reporter.log("Done");
});

