const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships')
    .where({ memberOpenids: OPENID, archived: false })
    .limit(1)
    .get()
  return (q.data || [])[0] || null
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

  const typeId = String(event.typeId || '').trim()

  const where = { relationshipId: rel._id }
  if (typeId) where.typeId = typeId

  const q = await db.collection('date_tags')
    .where(where)
    .orderBy('createdAt', 'asc')
    .limit(500)
    .get()

  const items = (q.data || []).map(t => ({
    id: t._id,
    typeId: t.typeId,
    name: t.name,
    createdAt: t.createdAt
  }))

  return { ok: true, items }
}
