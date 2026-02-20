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

async function ensureDefaultTypes(relationshipId) {
  const q = await db.collection('date_tag_types').where({ relationshipId }).limit(1).get()
  if ((q.data || []).length > 0) return

  const ts = now()
  const names = ['地点', '氛围']
  for (const name of names) {
    // eslint-disable-next-line no-await-in-loop
    await db.collection('date_tag_types').add({
      data: { relationshipId, name, createdAt: ts, updatedAt: ts }
    })
  }
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureDefaultTypes(rel._id)

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
