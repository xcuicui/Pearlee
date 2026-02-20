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

async function listTagsByType(relationshipId, typeId) {
  const q = await db.collection('date_tags')
    .where({ relationshipId, typeId })
    .limit(500)
    .get()
  return (q.data || []).filter(x => x && x._id)
}

async function removeTagsFromPlans(relationshipId, tagIds) {
  const ids = Array.from(new Set((tagIds || []).map(x => String(x || '').trim()).filter(Boolean)))
  if (!ids.length) return 0

  // Update plans that contain ANY of these tag ids.
  // We don't have an efficient query for multiple tagIds across arrays, so iterate by scanning.
  const pageSize = 100
  let skip = 0
  let updated = 0

  while (true) {
    const q = await db.collection('date_plans')
      .where({ relationshipId })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const plans = (q.data || []).filter(x => x && x._id)
    if (!plans.length) break

    for (const plan of plans) {
      const cur = Array.isArray(plan.tagIds) ? plan.tagIds.map(x => String(x)) : []
      const next = cur.filter(x => !ids.includes(x))
      if (next.length === cur.length) continue
      // eslint-disable-next-line no-await-in-loop
      await db.collection('date_plans').doc(plan._id).update({
        data: {
          tagIds: next,
          updatedAt: now()
        }
      })
      updated += 1
    }

    skip += plans.length
    if (plans.length < pageSize) break
  }

  return updated
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureCollection('date_tag_types')
  await ensureCollection('date_tags')
  await ensureCollection('date_plans')

  const typeId = String(event.typeId || event.id || '').trim()
  if (!typeId) throw new BizError('typeId 必填', 'MISSING_ID')

  const typeQ = await db.collection('date_tag_types').doc(typeId).get().catch(() => null)
  const type = typeQ && typeQ.data
  if (!type || type.relationshipId !== rel._id) {
    return { ok: false, error: 'not_found' }
  }

  const tags = await listTagsByType(rel._id, typeId)
  const tagIds = tags.map(t => t._id)

  const updatedPlans = await removeTagsFromPlans(rel._id, tagIds)

  // Delete tags under this type
  for (const tagId of tagIds) {
    // eslint-disable-next-line no-await-in-loop
    await db.collection('date_tags').doc(tagId).remove().catch(() => {})
  }

  // Delete the type
  await db.collection('date_tag_types').doc(typeId).remove()

  return {
    ok: true,
    deletedTags: tagIds.length,
    updatedPlans
  }
}
