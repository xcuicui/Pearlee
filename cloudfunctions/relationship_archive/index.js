const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getMine(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getMine(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await db.collection('relationships').doc(rel._id).update({
    data: {
      archived: true,
      updatedAt: now()
    }
  })

  return { ok: true }
}
