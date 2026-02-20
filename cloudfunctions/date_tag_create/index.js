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

async function ensureCollection(name) {
  try {
    await db.createCollection(name)
  } catch (e) {
    // ignore
  }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureCollection('date_tag_types')
  await ensureCollection('date_tags')

  const typeId = cleanText(event.typeId)
  const name = cleanText(event.name)
  if (!typeId) throw new BizError('typeId 必填', 'EMPTY')
  if (!name) throw new BizError('name 必填', 'EMPTY')
  if (name.length > 12) throw new BizError('name 最多 12 字', 'TOO_LONG')

  const typeQ = await db.collection('date_tag_types').doc(typeId).get().catch(() => null)
  const type = typeQ && typeQ.data
  if (!type || type.relationshipId !== rel._id) throw new BizError('类型不存在', 'NOT_FOUND')

  const dup = await db.collection('date_tags')
    .where({ relationshipId: rel._id, typeId, name })
    .limit(1)
    .get()
  if ((dup.data || []).length > 0) throw new BizError('同类型下已存在同名标签', 'duplicate_tag')

  const ts = now()
  const res = await db.collection('date_tags').add({
    data: { relationshipId: rel._id, typeId, name, createdAt: ts, updatedAt: ts }
  })
  return { ok: true, id: res._id }
}
