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

function rid(prefix) {
  const ts = Date.now()
  const rand = crypto.randomBytes(8).toString('hex')
  return `${prefix}_${ts}_${rand}`
}

function toErrorMessage(err) {
  return (err && (err.message || err.errMsg)) || 'unknown error'
}

function isDuplicateKeyError(err) {
  const msg = toErrorMessage(err).toLowerCase()
  return msg.includes('duplicate') || msg.includes('dup key') || msg.includes('唯一') || msg.includes('重复')
}

module.exports = { BizError, now, dayKey, rid, isDuplicateKeyError }
