const cloud = require('wx-server-sdk')
const crypto = require('crypto')
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

const PRIZE_POOL = [
  { prize_key: 'coffee', title: '咖啡券', desc: '想你时，给你买一杯咖啡。', weight: 20 },
  { prize_key: 'milk_tea', title: '奶茶券', desc: '把甜甜的那口，也收纳给你。', weight: 20 },
  { prize_key: 'hangout', title: '陪逛街券', desc: '一起慢慢走，什么都不急。', weight: 15 },
  { prize_key: 'play', title: '陪玩券', desc: '陪你玩一局（或你想玩的任何事）。', weight: 15 },
  { prize_key: 'sing', title: '唱歌券', desc: '给你唱一首歌，唱到你开心。', weight: 10 },
  { prize_key: 'wish', title: '小愿望满足券', desc: '一个小愿望，我来认真听。', weight: 5 },
  { prize_key: 'hug', title: '抱抱券', desc: '给你一个抱抱（可随时兑换）。', weight: 15 }
]

function getValidPool(pool) {
  return (Array.isArray(pool) ? pool : []).filter(x => x && Number(x.weight || 0) > 0)
}

function getTotalWeight(pool) {
  return getValidPool(pool).reduce((sum, x) => sum + Number(x.weight || 0), 0)
}

function drawPrize(pool, r) {
  const items = getValidPool(pool)
  if (!items.length) return null
  const totalWeight = items.reduce((sum, x) => sum + Number(x.weight || 0), 0)
  if (!(totalWeight > 0) || !(r >= 0) || !(r < totalWeight)) return null

  let acc = 0
  for (const it of items) {
    acc += Number(it.weight || 0)
    if (r < acc) return it
  }
  return items[items.length - 1] || null
}

function randomWeight(totalWeight) {
  if (!(totalWeight > 0)) return 0
  const u48 = crypto.randomBytes(6).readUIntBE(0, 6)
  const unit = u48 / 281474976710656 // 2^48
  return unit * totalWeight
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
  if (points <= 0) throw new BizError('贝壳不够啦，先去收纳一点想念。', 'INSUFFICIENT_POINTS')

  const totalWeight = getTotalWeight(PRIZE_POOL)
  if (totalWeight <= 0) throw new BizError('奖池暂时空着，稍后再来。', 'POOL_EMPTY')
  const r = randomWeight(totalWeight)
  const prize = drawPrize(PRIZE_POOL, r)
  if (!prize) throw new BizError('奖池暂时空着，稍后再来。', 'POOL_EMPTY')

  const couponDoc = {
    relationshipId,
    userOpenid: OPENID,
    prize_key: String(prize.prize_key),
    title: String(prize.title),
    desc: String(prize.desc),
    status: 'unused',
    obtained_at: ts,
    used_at: null
  }

  const ledgerRef = rid('lottery')

  // Ledger first (audit), then assets/coupon writes.
  await db.collection('point_ledger').add({
    data: {
      relationshipId,
      userOpenid: OPENID,
      type: 'lottery',
      ref_id: ledgerRef,
      delta_points: -1,
      delta_tickets: 0,
      meta: { prize_key: couponDoc.prize_key },
      created_at: ts
    }
  })

  const couponRes = await db.collection('coupons').add({ data: couponDoc })

  await db.collection('user_assets').doc(assetsDoc._id).update({
    data: {
      points_balance: db.command.inc(-1),
      updated_at: ts
    }
  })

  const assetsQ = await db.collection('user_assets').doc(assetsDoc._id).get()
  const nextPoints = Number(((assetsQ.data || {}).points_balance) || 0)
  const nextTickets = Number(((assetsQ.data || {}).ticket_balance) || 0)

  return {
    ok: true,
    points_balance: nextPoints,
    ticket_balance: nextTickets,
    coupon: {
      id: String(couponRes._id),
      title: couponDoc.title,
      desc: couponDoc.desc,
      status: couponDoc.status,
      obtained_at: couponDoc.obtained_at,
      used_at: couponDoc.used_at,
      prize_key: couponDoc.prize_key
    }
  }
}
