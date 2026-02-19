const cloud = require('wx-server-sdk')
const { BizError, now, rid } = require('./_shared')

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

function clampInt(n, min, max) {
  const x = Math.floor(Number(n || 0))
  if (!Number.isFinite(x)) return min
  return Math.min(max, Math.max(min, x))
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const count = clampInt(event.count, 1, 1)
  if (count !== 1) throw new BizError('参数不正确', 'INVALID_PARAM')

  const ts = now()
  const relationshipId = String(rel._id)

  const assetsDoc = await ensureAssetsDoc(relationshipId, OPENID, ts)
  const points = Number(assetsDoc.points_balance || 0)
  const tickets = Number(assetsDoc.ticket_balance || 0)

  const cost = 10
  if (points < cost) throw new BizError('贝壳不够啦，先攒一点再来。', 'INSUFFICIENT_POINTS')

  const ref_id = rid('exchange')

  await db.collection('point_ledger').add({
    data: {
      relationshipId,
      userOpenid: OPENID,
      type: 'exchange',
      ref_id,
      delta_points: -cost,
      delta_tickets: 1,
      meta: { count: 1, cost },
      created_at: ts
    }
  })

  await db.collection('user_assets').doc(assetsDoc._id).update({
    data: {
      points_balance: db.command.inc(-cost),
      ticket_balance: db.command.inc(1),
      updated_at: ts
    }
  })

  const q = await db.collection('user_assets').doc(assetsDoc._id).get()
  const next = q.data || {}

  return {
    ok: true,
    points_balance: Number(next.points_balance || 0),
    ticket_balance: Number(next.ticket_balance || 0)
  }
}
