function fallbackMe(nickname) {
  const s = String(nickname || '').trim()
  return s || '我'
}

function fallbackTa(nickname) {
  const s = String(nickname || '').trim()
  return s || 'TA'
}

module.exports = { fallbackMe, fallbackTa }
