const cloud = require('wx-server-sdk')
const crypto = require('crypto')
const { BizError, now, rid } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

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

const RARITY_WEIGHT_MAP = {
  common: 15,
  occasional: 8,
  rare: 3
}

function rarityToWeight(rarity) {
  return Number(RARITY_WEIGHT_MAP[String(rarity || '')] || 0)
}

async function listGiftPool(relationshipId, userOpenid) {
  const pageSize = 100
  let skip = 0
  const all = []

  while (true) {
    const q = await db.collection('gift_definitions')
      .where({
        space_id: relationshipId,
        recipient_user_id: userOpenid,
        is_active: true,
        is_deleted: _.neq(true)
      })
      .orderBy('updated_at', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const rows = q.data || []
    all.push(...rows)
    if (rows.length < pageSize) break
    skip += rows.length
  }

  return all
}

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

  const giftPool = (await listGiftPool(relationshipId, OPENID))
    .map(g => ({
      gift_id: String(g._id || ''),
      rarity: String(g.rarity || 'occasional'),
      title: String(g.title || ''),
      desc: String(g.description || ''),
      weight: rarityToWeight(g.rarity)
    }))
    .filter(g => g.gift_id && g.title)

  const totalWeight = getTotalWeight(giftPool)
  if (totalWeight <= 0) throw new BizError('橱窗里还没有给你的小礼物。', 'POOL_EMPTY')
  const r = randomWeight(totalWeight)
  const prize = drawPrize(giftPool, r)
  if (!prize) throw new BizError('橱窗里还没有给你的小礼物。', 'POOL_EMPTY')

  const couponDoc = {
    relationshipId,
    userOpenid: OPENID,
    gift_id: String(prize.gift_id),
    recipient_user_id: OPENID,
    gift_title_snapshot: String(prize.title),
    gift_desc_snapshot: String(prize.desc),
    rarity_snapshot: String(prize.rarity),
    title: String(prize.title),
    desc: String(prize.desc),
    status: 'unused',
    created_at: ts,
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
      meta: { gift_id: couponDoc.gift_id, rarity: couponDoc.rarity_snapshot },
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
      gift_id: couponDoc.gift_id,
      rarity_snapshot: couponDoc.rarity_snapshot
    }
  }
}
