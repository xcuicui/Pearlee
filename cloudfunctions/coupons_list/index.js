const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

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

  const list = q.data || []
  const giftIds = Array.from(new Set(
    list.map(c => String(c.gift_id || '').trim()).filter(Boolean)
  ))
  const deletedGiftIdSet = new Set()
  const chunkSize = 20
  for (let i = 0; i < giftIds.length; i += chunkSize) {
    const chunk = giftIds.slice(i, i + chunkSize)
    const gq = await db.collection('gift_definitions')
      .where({ _id: _.in(chunk), is_deleted: true })
      .get()
    for (const g of (gq.data || [])) {
      deletedGiftIdSet.add(String(g._id || ''))
    }
  }

  const coupons = list.map(c => {
    const giftId = String(c.gift_id || '').trim()
    const giftDeleted = !!(giftId && deletedGiftIdSet.has(giftId))
    const titleSnapshot = String(c.gift_title_snapshot || c.title || '')
    const descSnapshot = String(c.gift_desc_snapshot || c.desc || '')
    return {
    id: String(c._id),
    title: titleSnapshot,
    desc: descSnapshot,
    status: String(c.status || 'unused'),
    obtained_at: Number(c.obtained_at || 0),
    used_at: c.used_at ? Number(c.used_at) : null,
    gift_id: giftId || null,
    recipient_user_id: String(c.recipient_user_id || OPENID),
    rarity_snapshot: c.rarity_snapshot ? String(c.rarity_snapshot) : null,
    gift_deleted: giftDeleted,
    secondary_text: String(c.secondary_text || '')
    }
  })

  return { ok: true, coupons }
}
