const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const relationshipId = String(rel._id)

  const q = await db.collection('coupons')
    .where({ relationshipId, userOpenid: OPENID })
    .orderBy('obtained_at', 'desc')
    .get()

  const coupons = (q.data || []).map(c => ({
    id: String(c._id),
    title: String(c.title || ''),
    desc: String(c.desc || ''),
    status: String(c.status || 'unused'),
    obtained_at: Number(c.obtained_at || 0),
    used_at: c.used_at ? Number(c.used_at) : null
  }))

  return { ok: true, coupons }
}
