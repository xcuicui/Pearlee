const crypto = require('crypto')

class BizError extends Error {
  constructor(message, code = 'BIZ_ERROR') {
    super(message)
    this.code = code
  }
}

function now() { return Date.now() }

function pad2(n) { return String(n).padStart(2, '0') }
function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function inviteCode(len = 8) {
  return crypto.randomBytes(6).toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, len)
}

module.exports = {
  BizError,
  now,
  dayKey,
  inviteCode
}
