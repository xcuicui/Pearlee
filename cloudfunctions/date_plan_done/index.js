const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships')
    .where({ memberOpenids: OPENID, archived: false })
    .limit(1)
    .get()
  return (q.data || [])[0] || null
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const planId = String(event.planId || event.id || '').trim()
  if (!planId) throw new BizError('planId 必填', 'MISSING_ID')

  const done = !!event.done
  const ts = now()

  const q = await db.collection('date_plans').doc(planId).get().catch(() => null)
  const plan = q && q.data
  if (!plan || plan.relationshipId !== rel._id) throw new BizError('清单项不存在', 'NOT_FOUND')

  await db.collection('date_plans').doc(planId).update({
    data: {
      status: done ? 'done' : 'open',
      doneAt: done ? ts : 0,
      updatedAt: ts
    }
  })

  return { ok: true }
}
