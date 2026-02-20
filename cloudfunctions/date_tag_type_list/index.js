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

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureCollection('date_tag_types')

  const q = await db.collection('date_tag_types')
    .where({ relationshipId: rel._id })
    .orderBy('createdAt', 'asc')
    .limit(200)
    .get()

  const items = (q.data || []).map(x => ({
    id: x._id,
    name: x.name,
    createdAt: x.createdAt
  }))

  return { ok: true, items }
}
