
var Signer = require('../lib/signer').Signer;

var signer = new Signer();

function returnError(res, type, message) {
  var data = {
    result: 'error',
    error: type,
    error_message: message
  };
  res.send(JSON.stringify(data));
}

exports.sign = function(req, res, next){
  var signres;
  try {
    if ("string" !== typeof req.body.info) {
      returnError(res, "missingInfo", "Public information is missing.");
    }
    if ("string" !== typeof req.body.signreq) {
      returnError(res, "missingSignreq", "Signature request is missing.");
    }
    signres = signer.sign(""+req.body.info, ""+req.body.signreq);
  } catch (e) {
    returnError(res, "internalError", e.message);
    return;
  }
  var data = {
    result: 'success',
    signres: signres
  };
  res.send(JSON.stringify(data));
};
