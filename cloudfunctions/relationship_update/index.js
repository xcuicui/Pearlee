const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getMine(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function cleanName(s) {
  const name = String(s || '').trim()
  return name ? name.slice(0, 12) : '我们'
}

function cleanNickname(s) {
  return String(s || '').trim().slice(0, 12)
}

function cleanStartDate(s) {
  const v = String(s || '').trim()
  if (!v) return ''
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getMine(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const patch = {}
  if (Object.prototype.hasOwnProperty.call(event, 'name')) patch.name = cleanName(event.name)
  if (Object.prototype.hasOwnProperty.call(event, 'startDate')) patch.startDate = cleanStartDate(event.startDate)
  if (Object.prototype.hasOwnProperty.call(event, 'nickname')) {
    const memberNicknames = rel.memberNicknames && typeof rel.memberNicknames === 'object' ? rel.memberNicknames : {}
    memberNicknames[OPENID] = cleanNickname(event.nickname)
    patch.memberNicknames = memberNicknames
  }
  patch.updatedAt = now()

  await db.collection('relationships').doc(rel._id).update({ data: patch })

  return { ok: true }
}
