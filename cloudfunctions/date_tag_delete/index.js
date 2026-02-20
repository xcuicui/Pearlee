const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function getRel(OPENID) {
  const q = await db.collection('relationships')
    .where({ memberOpenids: OPENID, archived: false })
    .limit(1)
    .get()
  return (q.data || [])[0] || null
}

async function ensureCollection(name) {
  try {
    await db.createCollection(name)
  } catch (e) {
    // ignore
  }
}

async function removeTagFromPlans(relationshipId, tagId) {
  const pageSize = 100
  let lastId = ''
  let updated = 0

  while (true) {
    const q = await db.collection('date_plans')
      .where({ relationshipId, tagIds: tagId })
      .orderBy('_id', 'asc')
      .limit(pageSize)
      .get()

    const list = (q.data || []).filter(x => x && x._id)
    if (!list.length) break

    for (const plan of list) {
      // eslint-disable-next-line no-await-in-loop
      await db.collection('date_plans').doc(plan._id).update({
        data: {
          tagIds: _.pull(tagId),
          updatedAt: now()
        }
      })
      updated += 1
      lastId = plan._id
    }

    if (list.length < pageSize) break
    // Defensive: avoid infinite loops if orderBy/where is unstable.
    if (!lastId) break
  }

  return updated
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureCollection('date_tags')
  await ensureCollection('date_plans')

  const tagId = String(event.tagId || event.id || '').trim()
  if (!tagId) throw new BizError('tagId 必填', 'MISSING_ID')

  const q = await db.collection('date_tags').doc(tagId).get().catch(() => null)
  const tag = q && q.data
  if (!tag || tag.relationshipId !== rel._id) throw new BizError('标签不存在', 'NOT_FOUND')

  // Strategy A (cascade remove): remove from all plans first.
  const updatedPlans = await removeTagFromPlans(rel._id, tagId)

  await db.collection('date_tags').doc(tagId).remove()

  return { ok: true, updatedPlans }
}
