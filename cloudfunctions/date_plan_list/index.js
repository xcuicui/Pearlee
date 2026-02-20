const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

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

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  await ensureCollection('date_tag_types')
  await ensureCollection('date_tags')
  await ensureCollection('date_plans')

  const status = String(event.status || 'open')
  if (!['open', 'done'].includes(status)) throw new BizError('status 仅支持 open/done', 'INVALID_STATUS')

  let tagIds = event.tagIds
  if (!Array.isArray(tagIds)) tagIds = []
  tagIds = Array.from(new Set(tagIds.map(x => String(x || '').trim()).filter(Boolean)))

  const where = { relationshipId: rel._id, status }
  if (tagIds.length > 0) where.tagIds = _.all(tagIds)

  const q = await db.collection('date_plans')
    .where(where)
    .orderBy('createdAt', 'desc')
    .limit(Math.min(200, Math.max(1, Number(event.limit || 200))))
    .get()

  const plans = q.data || []
  const allTagIds = Array.from(new Set(plans.flatMap(p => (p.tagIds || []).map(x => String(x)))))

  let tagsById = {}
  if (allTagIds.length > 0) {
    const tagQ = await db.collection('date_tags')
      .where({ relationshipId: rel._id, _id: _.in(allTagIds) })
      .get()
    tagsById = Object.fromEntries((tagQ.data || []).map(t => [t._id, t]))
  }

  const items = plans.map(p => {
    const ids = (p.tagIds || []).map(x => String(x))
    return {
      id: p._id,
      title: p.title,
      notes: p.notes || '',
      status: p.status,
      createdAt: p.createdAt,
      doneAt: p.doneAt || 0,
      logCount: Number(p.logCount || 0),
      lastOccurAt: Number(p.lastOccurAt || 0),
      tagIds: ids,
      tags: ids.map(id => tagsById[id]).filter(Boolean).map(t => ({ id: t._id, typeId: t.typeId, name: t.name }))
    }
  })

  return { ok: true, items }
}
