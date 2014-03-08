var util = require('util');

function UserError(message) {
  if (this instanceof UserError) {
    throw new Error("Do not use custom error classes with 'new' keyword.");
  }

  var error = new Error(message);
  Error.captureStackTrace(error, UserError);

  error.name = "UserError";

  return error;
}

exports.UserError = UserError;
