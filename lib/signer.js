var bignum = require('bignum'),
    crypto = require('crypto');

var config = require('../config');

var Signer = function ()
{
  if ("object" !== typeof config.rsa)
    throw new Error('Config error: config.rsa is not an object');

  if ("string" !== typeof config.rsa.d)
    throw new Error('Config.error: config.rsa.d is not a string');

  if ("string" !== typeof config.rsa.e)
    throw new Error('Config error: config.rsa.e is not a string');

  this.e = bignum(config.rsa.e, 16);
  this.d = bignum(config.rsa.d, 16);
  this.phi = bignum(config.rsa.phi, 16);
  this.n = bignum(config.rsa.n, 16);
};

// Full domain hash based on SHA512
function fdh(data, bytelen)
{
  if (typeof data === "string") {
    data = new Buffer(data, "utf8");
  }

  // Add hashing rounds until we exceed desired length in bits
  var counter = 0, output = new Buffer(0);
  while (output.length < bytelen) {
    var buf = Buffer.concat([new Buffer([
      counter >>> 24,
      counter >>> 16,
      counter >>>  8,
      counter >>>  0
    ]), data]);
    var hash = crypto.createHash('sha512').update(buf).digest();
    output = Buffer.concat([output, hash]);
    counter++;
  }

  // Truncate to desired length
  output = output.slice(0, bytelen);

  return output;
}

Signer.prototype.sign = function (infoData, signreq)
{
  var info = this.verifyPublicInfo(infoData);

  // XXX Do something with the username - check if we know it, rate-limit etc.

  // Transform the unblinded portion of the message to the correct length using
  // a full domain hash.
  var publen = Math.ceil(Math.min((7+this.n.bitLength()) >>> 3, 256)/8);
  var vbuf = fdh(infoData, publen);
  // Last bit must be set
  vbuf[vbuf.length-1] |= 1;

  // v ... unblinded portion of message
  var v = bignum.fromBuffer(vbuf);
  // m ... blinded portion of message
  var m = bignum(signreq, 16);
  // r ... random server-side blinding factor
  var r = this.n.rand();

  // Verify 1 < m < n
  if (!m.gt(1))
    throw new Error("Invalid signing request: m <= 1");
  if (!m.lt(this.n))
    throw new Error("Invalid signing request: m >= n");

  // Verify Jacobi ( m | n ) = 1
  if (m.jacobi(this.n) !== 1)
    throw new Error("Invalid signing request: Jacobi symbol ( m | n ) != -1");

  // Apply server-side blinding
  //
  // Modular exponentiation leaks information about the exponent if the attacker
  // can collect timing information for a multiple iterations using known bases.
  m = m.mul(r.powm(v.mul(this.e), this.n)).mod(this.n);

  // Signing
  var s = m.powm(this.d.mul(v.invertm(this.phi)), this.n);

  // Server-side unblinding
  s = s.mul(r.invertm(this.n)).mod(this.n);

  return s.toString(16);
};

var pubInfoRegex = /^PAKDF_1_0_0:([1-9][0-9]*):([a-zA-Z0-9_\-.]+):([1-9][0-9]*):([a-zA-Z0-9_\-.]+):([1-9][0-9]*):([a-zA-Z0-9_\-.]+):$/;

/**
 * Check public info for validity.
 *
 *  - Must start with "PAKDF_1_0_0"
 *  - Followed by servername length (ASCII number, no leading zeros)
 *  - Followed by this server's servername (non-empty, restricted charset)
 *  - Followed by username length (ASCII number, no leading zeros)
 *  - Followed by a valid username (non-empty, restricted charset)
 *  - Followed by purpose length (ASCII number, no leading zeros)
 *  - Followed by a valid purpose (non-empty, restricted charset)
 *  - Separated by colons
 *  - Terminated by a colon
 *  - And no extra characters
 *
 * Returns the username as parsed from the public information.
 */
Signer.prototype.verifyPublicInfo = function (info)
{
  var match = pubInfoRegex.exec(info);

  if (!match) throw new Error("Invalid public info, unexpected format");

  if (match[1] != match[2].length)
    throw new Error("Invalid public info, servername length mismatch");

  if (match[2] !== config.serverName)
    throw new Error("Invalid public info, wrong servername");

  if (match[3] != match[4].length)
    throw new Error("Invalid public info, username length mismatch");

  if (match[5] != match[6].length)
    throw new Error("Invalid public info, purpose length mismatch");

  return {
    username: match[4],
    purpose: match[6]
  };
};
exports.Signer = Signer;

