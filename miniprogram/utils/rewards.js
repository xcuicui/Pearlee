const api = require('./api')

function toInt(v, fallback = 0) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.floor(n)
}

function normalizeAssets(res) {
  const assets = (res && res.assets) || {}
  const couponCounts = assets.coupon_counts || {}
  return {
    relationshipId: res && res.relationshipId ? String(res.relationshipId) : '',
    points_balance: toInt(assets.points_balance, 0),
    ticket_balance: toInt(assets.ticket_balance, 0),
    last_checkin_date: assets.last_checkin_date ? String(assets.last_checkin_date) : '',
    coupon_counts: {
      unused: toInt(couponCounts.unused, 0),
      used: toInt(couponCounts.used, 0)
    }
  }
}

function refreshAssets() {
  return api.call('assets_get').then(normalizeAssets)
}

function checkin() {
  return api.call('checkin')
}

function earnMurmurPoints({ entryId, content_len, image_count }) {
  const refId = String(entryId || '').trim()
  return api.call('points_earn', {
    type: 'murmur',
    ref_id: refId,
    content_len: toInt(content_len, 0),
    image_count: toInt(image_count, 0)
  })
}

function exchangeTicket() {
  return api.call('tickets_exchange', { count: 1 })
}

function drawLottery() {
  return api.call('lottery_draw', { count: 1 })
}

function listCoupons() {
  return api.call('coupons_list')
}

function useCoupon(id) {
  return api.call('coupons_use', { id: String(id || '').trim() })
}

module.exports = {
  refreshAssets,
  checkin,
  earnMurmurPoints,
  exchangeTicket,
  drawLottery,
  listCoupons,
  useCoupon
}
