const crypto = require('crypto')

function now() { return Date.now() }

function randomInviteCode() {
  // 8 位大写字母数字
  return crypto.randomBytes(6).toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 8)
}

class BizError extends Error {
  constructor(message, code = 'BIZ_ERROR') {
    super(message)
    this.code = code
  }
}

module.exports = {
  now,
  randomInviteCode,
  BizError
}
