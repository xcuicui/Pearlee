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

function cleanText(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim()
}

async function assertTagsBelongToRel(relationshipId, tagIds) {
  if (!Array.isArray(tagIds) || tagIds.length === 0) return
  const uniq = Array.from(new Set(tagIds.map(x => String(x || '').trim()).filter(Boolean)))
  if (uniq.length === 0) return

  const q = await db.collection('date_tags')
    .where({ relationshipId, _id: db.command.in(uniq) })
    .get()
  const found = new Set((q.data || []).map(x => x._id))
  for (const id of uniq) {
    if (!found.has(id)) throw new BizError('无效标签', 'invalid_tag')
  }
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

  const title = cleanText(event.title)
  const notes = cleanText(event.notes)
  const tagIds = Array.isArray(event.tagIds) ? event.tagIds : (Array.isArray(event.tags) ? event.tags : [])

  if (!title) throw new BizError('标题必填', 'EMPTY_TITLE')
  if (title.length > 50) throw new BizError('标题最多 50 字', 'TOO_LONG')
  if (notes && notes.length > 300) throw new BizError('备注最多 300 字', 'TOO_LONG')

  await assertTagsBelongToRel(rel._id, tagIds)

  const ts = now()
  const data = {
    relationshipId: rel._id,
    title,
    notes: notes || '',
    status: 'open',
    tagIds: Array.from(new Set((tagIds || []).map(x => String(x || '').trim()).filter(Boolean))),
    logCount: 0,
    lastOccurAt: 0,
    createdAt: ts,
    updatedAt: ts
  }

  const res = await db.collection('date_plans').add({ data })
  return { ok: true, id: res._id }
}
