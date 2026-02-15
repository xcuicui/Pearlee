const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

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

  const date = String(event.date || '').trim()
  if (!date) throw new BizError('缺少日期', 'MISSING_DATE')

  const entriesQ = await db.collection('entries')
    .where({ relationshipId: rel._id, dayKey: date, isDeleted: false })
    .orderBy('createdAt', 'asc')
    .limit(200)
    .get()
  const entries = entriesQ.data || []

  const entryIds = entries.map(x => x._id)

  const [likesQ, commentsQ] = await Promise.all([
    entryIds.length
      ? db.collection('likes').where({ entryId: db.command.in(entryIds) }).get()
      : Promise.resolve({ data: [] }),
    entryIds.length
      ? db.collection('comments').where({ entryId: db.command.in(entryIds) }).get()
      : Promise.resolve({ data: [] })
  ])

  const likes = likesQ.data || []
  const comments = commentsQ.data || []

  const likeCount = new Map()
  const likedSet = new Set()
  for (const x of likes) {
    likeCount.set(x.entryId, (likeCount.get(x.entryId) || 0) + 1)
    if (x.userOpenid === OPENID) likedSet.add(x.entryId)
  }

  const commentMap = new Map()
  for (const c of comments) {
    // MVP: only one comment per entry; if multiple exist, keep latest
    const prev = commentMap.get(c.entryId)
    if (!prev || (prev.createdAt || 0) < (c.createdAt || 0)) commentMap.set(c.entryId, c)
  }

  return {
    ok: true,
    items: entries.map(e => ({
      id: e._id,
      text: e.contentText || '',
      images: Array.isArray(e.images)
        ? e.images.map(x => String(x || '').trim()).filter(Boolean).slice(0, 3)
        : [],
      createdAt: e.createdAt,
      likeCount: likeCount.get(e._id) || 0,
      liked: likedSet.has(e._id),
      comment: commentMap.get(e._id)
        ? {
            id: commentMap.get(e._id)._id,
            content: commentMap.get(e._id).content || '',
            userOpenid: commentMap.get(e._id).userOpenid,
            createdAt: commentMap.get(e._id).createdAt
          }
        : null
    }))
  }
}
