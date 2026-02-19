const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const id = String(event.id || '').trim()
  if (!id) throw new BizError('参数不正确', 'INVALID_PARAM')

  const relationshipId = String(rel._id)
  const q = await db.collection('coupons').doc(id).get()
  const hit = q.data
  if (!hit) throw new BizError('这张券不见啦', 'NOT_FOUND')

  if (String(hit.relationshipId) !== relationshipId || String(hit.userOpenid) !== OPENID) {
    throw new BizError('没有权限操作这张券', 'FORBIDDEN')
  }

  if (String(hit.status || '') === 'used') {
    return {
      ok: true,
      coupon: {
        id: String(hit._id),
        title: String(hit.title || ''),
        desc: String(hit.desc || ''),
        status: 'used',
        obtained_at: Number(hit.obtained_at || 0),
        used_at: hit.used_at ? Number(hit.used_at) : null
      }
    }
  }

  const ts = now()
  await db.collection('coupons').doc(id).update({
    data: {
      status: 'used',
      used_at: ts
    }
  })

  const nextQ = await db.collection('coupons').doc(id).get()
  const next = nextQ.data || {}

  return {
    ok: true,
    coupon: {
      id: String(next._id),
      title: String(next.title || ''),
      desc: String(next.desc || ''),
      status: String(next.status || 'used'),
      obtained_at: Number(next.obtained_at || 0),
      used_at: next.used_at ? Number(next.used_at) : null
    }
  }
}
