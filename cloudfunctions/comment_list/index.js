const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')
const { encodeCursor, decodeCursor } = require('./_shared/cursor')
const { loadRelationshipMembersMap, nicknameFallback } = require('./_shared/nickname')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function clampLimit(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return 20
  return Math.max(1, Math.min(50, Math.floor(n)))
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const entryId = String(event.entryId || '').trim()
  if (!entryId) throw new BizError('缺少 entryId', 'MISSING_ID')

  const entryQ = await db.collection('entries').doc(entryId).get()
  const entry = entryQ && entryQ.data
  if (!entry || entry.isDeleted) throw new BizError('记录不存在', 'ENTRY_NOT_FOUND')
  if (entry.relationshipId !== rel._id) throw new BizError('无权限', 'FORBIDDEN')

  const limit = clampLimit(event.limit)
  const cur = decodeCursor(event.cursor)

  let q = db.collection('comments').where({ entryId, relationshipId: rel._id })

  if (cur) {
    // emulate (createdAt, _id) > (cur.createdAt, cur.id) in asc order
    const _ = db.command
    q = db.collection('comments').where(_.and([
      { entryId, relationshipId: rel._id },
      _.or([
        { createdAt: _.gt(cur.createdAt) },
        _.and([{ createdAt: _.eq(cur.createdAt) }, { _id: _.gt(cur.id) }])
      ])
    ]))
  }

  const res = await q.orderBy('createdAt', 'asc').orderBy('_id', 'asc').limit(limit + 1).get()
  const rows = res.data || []

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows

  const members = await loadRelationshipMembersMap(db, rel._id)

  const comments = page.map((c) => {
    const userOpenid = String(c.userOpenid || '').trim()
    const isMine = userOpenid === OPENID
    const authorNickname = (members.get(userOpenid) || '').trim() || nicknameFallback(isMine)

    return {
      id: c._id,
      entryId: String(c.entryId || ''),
      userOpenid,
      authorNickname,
      content: String(c.content || ''),
      createdAt: Number(c.createdAt || 0),
      isMine
    }
  })

  const nextCursor = hasMore
    ? encodeCursor(page[page.length - 1].createdAt, page[page.length - 1]._id)
    : null

  return { ok: true, comments, nextCursor }
}
