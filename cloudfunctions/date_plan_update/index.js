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

async function assertTagsBelongToRel(relationshipId, tagIds) {
  const uniq = Array.from(new Set((tagIds || []).map(x => String(x || '').trim()).filter(Boolean)))
  if (uniq.length === 0) return uniq

  const q = await db.collection('date_tags')
    .where({ relationshipId, _id: db.command.in(uniq) })
    .get()
  const found = new Set((q.data || []).map(x => x._id))
  for (const id of uniq) {
    if (!found.has(id)) throw new BizError('无效标签', 'invalid_tag')
  }
  return uniq
}

async function ensureCollection(name) {
  try {
    await db.createCollection(name)
  } catch (e) {
    // ignore
  }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureCollection('date_plans')
  await ensureCollection('date_tags')

  const planId = String(event.planId || event.id || '').trim()
  if (!planId) throw new BizError('planId 必填', 'MISSING_ID')

  const q = await db.collection('date_plans').doc(planId).get().catch(() => null)
  const plan = q && q.data
  if (!plan || plan.relationshipId !== rel._id) throw new BizError('清单项不存在', 'NOT_FOUND')

  const tagIds = await assertTagsBelongToRel(rel._id, event.tagIds)

  const ts = now()
  await db.collection('date_plans').doc(planId).update({
    data: { tagIds, updatedAt: ts }
  })

  return { ok: true }
}
