const cloud = require('wx-server-sdk')
const { now, BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function assertAccess(OPENID, coupleId) {
  const q = await db.collection('couples').doc(coupleId).get().catch(() => null)
  const couple = q && q.data
  if (!couple || couple.status !== 'active') throw new BizError('情侣空间不存在', 'NO_COUPLE')
  if (!(couple.memberOpenids || []).includes(OPENID)) throw new BizError('无权限', 'NO_AUTH')
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event
  if (!id) throw new BizError('id 必填')

  const q = await db.collection('dates').doc(id).get()
  const item = q.data
  if (!item) throw new BizError('约会不存在', 'NOT_FOUND')

  await assertAccess(OPENID, item.coupleId)

  await db.collection('dates').doc(id).update({
    data: { status: 'done', doneAt: now(), updatedAt: now() }
  })

  return { ok: true }
}
