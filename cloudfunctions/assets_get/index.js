const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

async function ensureAssetsDoc(relationshipId, userOpenid, ts) {
  const q = await db.collection('user_assets').where({ relationshipId, userOpenid }).limit(1).get()
  const hit = (q.data || [])[0]
  if (hit) return hit

  const doc = {
    relationshipId,
    userOpenid,
    points_balance: 0,
    ticket_balance: 0,
    last_checkin_date: '',
    created_at: ts,
    updated_at: ts
  }

  const res = await db.collection('user_assets').add({ data: doc })
  return { _id: res._id, ...doc }
}

async function couponCounts(relationshipId, userOpenid) {
  const list = await db.collection('coupons').where({ relationshipId, userOpenid }).get()
  const data = list.data || []
  let unused = 0
  let used = 0
  for (const c of data) {
    if (String(c.status || '') === 'used') used += 1
    else unused += 1
  }
  return { unused, used }
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const ts = now()
  const assetDoc = await ensureAssetsDoc(String(rel._id), OPENID, ts)
  const counts = await couponCounts(String(rel._id), OPENID)

  return {
    ok: true,
    relationshipId: String(rel._id),
    assets: {
      points_balance: Number(assetDoc.points_balance || 0),
      ticket_balance: Number(assetDoc.ticket_balance || 0),
      last_checkin_date: String(assetDoc.last_checkin_date || ''),
      coupon_counts: counts
    }
  }
}
