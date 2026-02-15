const cloud = require('wx-server-sdk')
const { BizError, now, inviteCode } = require('../_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function cleanName(s) {
  return String(s || '').trim().slice(0, 12) || '我们'
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  // if already in a relationship, return it
  const existingQ = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  const hit = (existingQ.data || [])[0]
  if (hit) {
    return { ok: true, id: hit._id, inviteCode: hit.inviteCode }
  }

  const name = cleanName(event.name)
  const startDate = event.startDate ? String(event.startDate) : ''

  const ts = now()
  let code = inviteCode(8)

  // avoid collision
  for (let i = 0; i < 3; i++) {
    const q = await db.collection('relationships').where({ inviteCode: code }).limit(1).get()
    if ((q.data || []).length === 0) break
    code = inviteCode(8)
  }

  const res = await db.collection('relationships').add({
    data: {
      name,
      startDate,
      inviteCode: code,
      memberOpenids: [OPENID],
      archived: false,
      createdAt: ts,
      updatedAt: ts
    }
  })

  return { ok: true, id: res._id, inviteCode: code }
}
