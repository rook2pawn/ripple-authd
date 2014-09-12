var response = require('response')
var config = require('../config')

var Signer = require('../lib/signer').Signer,
    url    = require('url');

var signer = new Signer();
var testSigner = new Signer(require('../test.rsa.json'))

function returnError(res, type, message) {
  var data = {
    result: 'error',
    error: type,
    error_message: message
  };
  response.json(data).status(400).pipe(res)
}

function doCors(req, res)
{
  var origin = req.headers.origin;
  if (origin &&
      config.allowedOriginDomains &&
      Array.isArray(config.allowedOriginDomains)) {
    var allowed = false;
    var parsedUrl = url.parse(origin);
    var hostname = parsedUrl.hostname;
    config.allowedOriginDomains.forEach(function (domain) {
      if (domain === "*") {
        allowed = true;
      } else if (config.allowSubdomainOrigin) {
        // Check if hostname ends with allowed domain
        if (hostname.indexOf(domain, hostname.length - domain.length) !== -1) {
          allowed = true;
        }
      } else {
        if (hostname === domain) {
          allowed = true;
        }
      }
    });

    if (!config.allowNonSslOrigin && parsedUrl.protocol !== "https:") {
      allowed = false;
    }

    if (allowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
  }
}
exports.cors = function(req, res, next)
{
  doCors(req, res);
  res.end();
};

exports.sign = function(req, res, next)
{
  var signres;
  try {
    if ("string" !== typeof req.body.info) {
      returnError(res, "missingInfo", "Public information is missing.");
        return
    }
    if ("string" !== typeof req.body.signreq) {
      returnError(res, "missingSignreq", "Signature request is missing.");
        return
    }
    signres = signer.sign(""+req.body.info, ""+req.body.signreq);
    console.log(signres)
  } catch (e) {
    if (e && e.name === "UserError") {
      returnError(res, "userError", e.message);
    } else {
      console.log('---');
      if (e && e.stack) console.log(e.stack);
      else console.log("Non-Error value thrown: "+e);

      returnError(res, "internalError", "An internal server error occurred.");
    }
    return;
  }
  var data = {
    result: 'success',
    signres: signres,
    modulus: config.rsa.n,
    alpha: config.rsa.a,
    exponent: config.rsa.e
  };
  response.json(data).pipe(res);
};

exports.test = function(req, res, next)
{
  var signres;
  try {
    if ("string" !== typeof req.body.info) {
      returnError(res, "missingInfo", "Public information is missing.");
        return
    }
    if ("string" !== typeof req.body.signreq) {
      returnError(res, "missingSignreq", "Signature request is missing.");
        return
    }
    signres = testSigner.test(""+req.body.info, ""+req.body.signreq);
    console.log(signres)
  } catch (e) {
    if (e && e.name === "UserError") {
      returnError(res, "userError", e.message);
    } else {
      console.log('---');
      if (e && e.stack) console.log(e.stack);
      else console.log("Non-Error value thrown: "+e);

      returnError(res, "internalError", "An internal server error occurred.");
    }
    return;
  }
  var data = {
    result: 'success',
    signres: signres,
    test:true
  };
  response.json(data).pipe(res);
};
