const crypto = require('crypto');

const cryptoStr = str => {
  const sha1 = crypto.createHash('sha1');
  const newStr = sha1.update(str).digest('hex');
  return newStr;
}

module.exports = cryptoStr;

