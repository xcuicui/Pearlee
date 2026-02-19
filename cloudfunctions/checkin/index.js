const cloud = require('wx-server-sdk')
const { BizError, now, dayKey, isDuplicateKeyError } = require('./_shared')

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

async function applyCheckin(assetsDocId, date, earned, ts) {
  await db.collection('user_assets').doc(assetsDocId).update({
    data: {
      points_balance: db.command.inc(earned),
      last_checkin_date: date,
      updated_at: ts
    }
  })

  const q = await db.collection('user_assets').doc(assetsDocId).get()
  return Number((q.data || {}).points_balance || 0)
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const ts = now()
  const date = dayKey(ts)
  const relationshipId = String(rel._id)

  const assetsDoc = await ensureAssetsDoc(relationshipId, OPENID, ts)
  const currentBalance = Number(assetsDoc.points_balance || 0)

  const earned = 3
  try {
    await db.collection('point_ledger').add({
      data: {
        relationshipId,
        userOpenid: OPENID,
        type: 'checkin',
        ref_id: date,
        delta_points: earned,
        delta_tickets: 0,
        meta: { date },
        created_at: ts
      }
    })
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { ok: true, earned_points: 0, checked_in: true, date, points_balance: currentBalance }
    }
    throw err
  }

  const nextBalance = await applyCheckin(assetsDoc._id, date, earned, ts)
  return { ok: true, earned_points: earned, checked_in: true, date, points_balance: nextBalance }
}
