function encodeCursor(createdAt, id) {
  const obj = { createdAt: Number(createdAt || 0), id: String(id || '') }
  const raw = JSON.stringify(obj)
  return Buffer.from(raw, 'utf8').toString('base64')
}

function decodeCursor(cursor) {
  if (!cursor) return null
  try {
    const raw = Buffer.from(String(cursor), 'base64').toString('utf8')
    const obj = JSON.parse(raw)
    const createdAt = Number(obj && obj.createdAt)
    const id = String(obj && obj.id || '')
    if (!Number.isFinite(createdAt) || !id) return null
    return { createdAt, id }
  } catch (e) {
    return null
  }
}

module.exports = { encodeCursor, decodeCursor }
