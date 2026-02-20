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

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const planId = String(event.planId || '').trim()
  if (!planId) throw new BizError('planId 必填', 'MISSING_ID')

  const limit = Math.min(60, Math.max(1, Number(event.limit || 30)))

  const q = await db.collection('date_diaries')
    .where({ relationshipId: rel._id, planId })
    .orderBy('occurAt', 'desc')
    .limit(limit)
    .get()

  const items = (q.data || []).map(x => ({
    id: x._id,
    planId: x.planId,
    planTitle: x.planTitle || '',
    text: x.text || '',
    images: x.images || [],
    occurAt: x.occurAt,
    createdAt: x.createdAt
  }))

  return { ok: true, items }
}
