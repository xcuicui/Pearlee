const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships')
    .where({ memberOpenids: OPENID, archived: false })
    .limit(1)
    .get()
  return (q.data || [])[0] || null
}

function cleanText(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim()
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const name = cleanText(event.name)
  if (!name) throw new BizError('name 必填', 'EMPTY')
  if (name.length > 12) throw new BizError('name 最多 12 字', 'TOO_LONG')

  const exists = await db.collection('date_tag_types')
    .where({ relationshipId: rel._id, name })
    .limit(1)
    .get()
  if ((exists.data || []).length > 0) throw new BizError('已存在同名类型', 'duplicate_type')

  const ts = now()
  const res = await db.collection('date_tag_types').add({
    data: { relationshipId: rel._id, name, createdAt: ts, updatedAt: ts }
  })

  return { ok: true, id: res._id }
}
