const cloud = require('wx-server-sdk')
const { BizError, now, isDuplicateKeyError } = require('./_shared')

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

function tierPointsForTextLen(contentLen) {
  const n = clampInt(contentLen, 0, 1000000)
  if (n <= 0) return 0
  if (n <= 10) return 2
  if (n <= 20) return 4
  if (n <= 50) return 6
  if (n <= 200) return 8
  return 10
}

function tierPointsForImageCount(imageCount) {
  const n = clampInt(imageCount, 0, 9)
  if (n <= 0) return 0
  if (n === 1) return 2
  if (n <= 3) return 4
  return 6
}

function computeEarnedPoints(contentLen, imageCount) {
  const img = clampInt(imageCount, 0, 9)
  const textLen = clampInt(contentLen, 0, 1000000)
  const textPoints = (textLen === 0 && img > 0) ? 0 : tierPointsForTextLen(textLen)
  const imgPoints = tierPointsForImageCount(img)
  return Math.min(16, textPoints + imgPoints)
}

async function getAssetsBalance(relationshipId, userOpenid, ts) {
  const doc = await ensureAssetsDoc(relationshipId, userOpenid, ts)
  return {
    doc,
    points_balance: Number(doc.points_balance || 0),
    ticket_balance: Number(doc.ticket_balance || 0)
  }
}

async function applyPointsDelta(assetsDocId, deltaPoints, ts) {
  await db.collection('user_assets').doc(assetsDocId).update({
    data: {
      points_balance: db.command.inc(deltaPoints),
      updated_at: ts
    }
  })

  const q = await db.collection('user_assets').doc(assetsDocId).get()
  return Number((q.data || {}).points_balance || 0)
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const type = String(event.type || '').trim()
  const ref_id = String(event.ref_id || '').trim()

  if (type !== 'murmur') throw new BizError('参数不正确', 'INVALID_PARAM')
  if (!ref_id) throw new BizError('参数不正确', 'INVALID_PARAM')

  const ts = now()
  const relationshipId = String(rel._id)

  const content_len = clampInt(event.content_len, 0, 1000000)
  const image_count = clampInt(event.image_count, 0, 9)

  const earned = computeEarnedPoints(content_len, image_count)
  if (earned <= 0) {
    // still write ledger for idempotency (optional). MVP: treat as no-op without ledger.
    return { ok: true, earned_points: 0, points_balance: (await getAssetsBalance(relationshipId, OPENID, ts)).points_balance }
  }

  // Ensure assets doc exists
  const { doc: assetsDoc, points_balance } = await getAssetsBalance(relationshipId, OPENID, ts)

  try {
    await db.collection('point_ledger').add({
      data: {
        relationshipId,
        userOpenid: OPENID,
        type,
        ref_id,
        delta_points: earned,
        delta_tickets: 0,
        meta: { content_len, image_count },
        created_at: ts
      }
    })
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { ok: true, earned_points: 0, points_balance }
    }
    throw err
  }

  const nextBalance = await applyPointsDelta(assetsDoc._id, earned, ts)
  return { ok: true, earned_points: earned, points_balance: nextBalance }
}
