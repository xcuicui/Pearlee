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

async function ensureDefaultTaxonomy(relationshipId) {
  const typeQ = await db.collection('date_tag_types').where({ relationshipId }).limit(1).get()
  if ((typeQ.data || []).length > 0) return

  const ts = now()
  const defaults = [
    { name: '地点', tags: ['室内', '户外'] },
    { name: '氛围', tags: ['松弛', '浪漫', '热闹'] }
  ]

  const createdTypeIds = {}
  for (const t of defaults) {
    // eslint-disable-next-line no-await-in-loop
    const r = await db.collection('date_tag_types').add({
      data: { relationshipId, name: t.name, createdAt: ts, updatedAt: ts }
    })
    createdTypeIds[t.name] = r._id
  }

  for (const t of defaults) {
    const typeId = createdTypeIds[t.name]
    for (const name of t.tags) {
      // eslint-disable-next-line no-await-in-loop
      await db.collection('date_tags').add({
        data: { relationshipId, typeId, name, createdAt: ts, updatedAt: ts }
      })
    }
  }
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

  await ensureDefaultTaxonomy(rel._id)

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
