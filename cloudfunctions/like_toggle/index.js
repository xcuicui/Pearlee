const cloud = require('wx-server-sdk')
const { BizError, now } = require('../_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const entryId = String(event.entryId || '').trim()
  if (!entryId) throw new BizError('缺少 entryId', 'MISSING_ID')

  // ensure entry belongs to relationship
  const entryQ = await db.collection('entries').doc(entryId).get()
  const entry = entryQ && entryQ.data
  if (!entry || entry.isDeleted) throw new BizError('记录不存在', 'NOT_FOUND')
  if (entry.relationshipId !== rel._id) throw new BizError('无权限', 'FORBIDDEN')

  const likeQ = await db.collection('likes').where({ entryId, userOpenid: OPENID }).limit(1).get()
  const like = (likeQ.data || [])[0]

  if (like) {
    await db.collection('likes').doc(like._id).remove()
    return { ok: true, liked: false }
  }

  await db.collection('likes').add({ data: { entryId, userOpenid: OPENID, createdAt: now() } })
  return { ok: true, liked: true }
}
