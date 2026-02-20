const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function getImageRef(v) {
  if (!v) return ''
  if (typeof v === 'string') return String(v || '').trim()
  if (typeof v === 'object') return String(v.url || v.fileID || v.fileId || '').trim()
  return ''
}

function normalizeMoodLevel(level) {
  const n = Number(level)
  if (!Number.isInteger(n) || n < 1 || n > 4) return 0
  return n
}

async function getTempUrlMap(fileIds) {
  const list = Array.from(new Set((fileIds || []).map(x => String(x || '').trim()).filter(Boolean)))
  const map = new Map()
  if (!list.length) return map

  try {
    const res = await cloud.getTempFileURL({ fileList: list })
    const out = (res && res.fileList) || []
    for (const x of out) {
      const fid = String((x && (x.fileID || x.fileId)) || '').trim()
      const url = String((x && x.tempFileURL) || '').trim()
      if (fid && url) map.set(fid, url)
    }
  } catch (e) {
    // If it fails, fall back to returning original fileIDs (client may still load if permitted)
    console.log('[day_entries] getTempFileURL failed:', e)
  }

  return map
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const date = String(event.date || '').trim()
  if (!date) throw new BizError('缺少日期', 'MISSING_DATE')

  const where = db.command.or([
    { relationshipId: rel._id, date, isDeleted: false },
    { relationshipId: rel._id, dayKey: date, isDeleted: false }
  ])
  const entriesQ = await db.collection('entries')
    .where(where)
    .orderBy('createdAt', 'asc')
    .limit(200)
    .get()
  const entries = entriesQ.data || []

  const entryIds = entries.map(x => x._id)

  // Build temp URLs for images on server side to avoid per-user storage permission issues
  const allFileIds = []
  for (const e of entries) {
    const imgs = Array.isArray(e.images) ? e.images : []
    for (const fid of imgs) {
      const ref = getImageRef(fid)
      if (ref && ref.startsWith('cloud://')) allFileIds.push(ref)
    }
  }
  const tempUrlMap = await getTempUrlMap(allFileIds)

  const [likesQ, commentsQ] = await Promise.all([
    entryIds.length
      ? db.collection('likes').where({ entryId: db.command.in(entryIds) }).get()
      : Promise.resolve({ data: [] }),
    entryIds.length
      ? db.collection('comments').where({ entryId: db.command.in(entryIds), relationshipId: rel._id }).get()
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

  const commentCount = new Map()
  for (const c of comments) {
    const k = String(c.entryId || '')
    if (!k) continue
    commentCount.set(k, (commentCount.get(k) || 0) + 1)
  }

  return {
    ok: true,
    items: entries.map(e => {
      const fileIds = Array.isArray(e.images)
        ? e.images.map(x => getImageRef(x)).filter(Boolean).slice(0, 9)
        : []

      const urls = fileIds
        .map(fid => tempUrlMap.get(fid) || fid)
        .filter(Boolean)
        .slice(0, 9)

      const item = {
        id: e._id,
        text: e.contentText || '',
        images: urls,
        createdAt: e.createdAt,
        likeCount: likeCount.get(e._id) || 0,
        liked: likedSet.has(e._id),
        commentCount: commentCount.get(e._id) || 0
      }

      const moodLevel = normalizeMoodLevel(e.mood_level)
      if (moodLevel) item.mood_level = moodLevel

      return item
    })
  }
}
