const { debug } = require('../env')

function withTimeout(promise, ms, label) {
  if (!ms) return promise
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error((label || '请求') + '超时，请稍后重试')
      err.code = 'REQUEST_TIMEOUT'
      reject(err)
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function extractMessage(err) {
  const raw = (err && (err.message || err.errMsg)) || '请求失败'
  const idx = raw.lastIndexOf('Error: ')
  if (idx >= 0) return raw.slice(idx + 7).trim() || raw
  return raw
}

function call(name, data = {}) {
  if (!name) return Promise.reject(new Error('云函数名不能为空'))

  if (debug) console.log('[api.call] start', name, data)

  const p = wx.cloud.callFunction({ name, data }).then(res => res.result)
  return withTimeout(p, 12000, name)
    .then(result => {
      if (debug) console.log('[api.call] ok', name)
      return result
    })
    .catch(err => {
      const msg = extractMessage(err)
      const e = new Error(msg)
      e.raw = err
      if (debug) console.error('[api.call] fail', name, err)
      throw e
    })
}

module.exports = { call }
