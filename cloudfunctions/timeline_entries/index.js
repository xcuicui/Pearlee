const cloud = require('wx-server-sdk')
const { BizError, dayKey } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function parseYmd(s) {
  const m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  return d
}

function addDays(d, delta) {
  const out = new Date(d.getTime())
  out.setDate(out.getDate() + delta)
  return out
}

function normalizeDirection(v) {
  const s = String(v || 'initial').trim()
  return (s === 'older' || s === 'newer') ? s : 'initial'
}

function normalizeWindowDays(v) {
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) return 7
  return Math.min(n, 31)
}

function normalizeLimit(v) {
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) return 60
  return Math.min(n, 200)
}

function normalizeCursor(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.floor(n)
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

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
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
    console.log('[timeline_entries] getTempFileURL failed:', e)
  }

  return map
}

function uniqueById(entries) {
  const seen = new Set()
  const out = []
  for (const e of (entries || [])) {
    const id = String((e && e._id) || '')
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(e)
  }
  return out
}

function rangeByDirection(anchorDate, windowDays, direction, cursor) {
  const anchor = parseYmd(anchorDate)
  if (!anchor) return null

  const start = addDays(anchor, -windowDays)
  start.setHours(0, 0, 0, 0)
  const end = addDays(anchor, windowDays + 1)
  end.setHours(0, 0, 0, 0)

  if (direction === 'initial') {
    return {
      where: db.command.gte(start.getTime()).and(db.command.lt(end.getTime())),
      order: 'asc',
      fallbackOlderCursor: start.getTime(),
      fallbackNewerCursor: end.getTime() - 1
    }
  }

  if (!cursor) return null
  if (direction === 'older') {
    return {
      where: db.command.lt(cursor),
      order: 'desc',
      fallbackOlderCursor: cursor,
      fallbackNewerCursor: cursor
    }
  }

  return {
    where: db.command.gt(cursor),
    order: 'asc',
    fallbackOlderCursor: cursor,
    fallbackNewerCursor: cursor
  }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const anchorDate = String(event.anchorDate || '').trim()
  if (!parseYmd(anchorDate)) throw new BizError('anchorDate 格式错误', 'INVALID_ANCHOR_DATE')

  const direction = normalizeDirection(event.direction)
  const windowDays = normalizeWindowDays(event.windowDays)
  const limit = normalizeLimit(event.limit)
  const cursor = normalizeCursor(event.cursor)

  const range = rangeByDirection(anchorDate, windowDays, direction, cursor)
  if (!range) {
    return {
      ok: true,
      items: [],
      olderCursor: cursor || undefined,
      newerCursor: cursor || undefined,
      anchorDate
    }
  }

  const entriesQ = await db.collection('entries')
    .where({
      relationshipId: rel._id,
      isDeleted: false,
      createdAt: range.where
    })
    .orderBy('createdAt', range.order)
    .limit(limit)
    .get()

  let entries = uniqueById(entriesQ.data || [])
  if (direction === 'older') entries = entries.reverse()

  const entryIds = entries.map(x => x._id).filter(Boolean)

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

  const items = entries.map((e) => {
    const fileIds = Array.isArray(e.images)
      ? e.images.map(x => getImageRef(x)).filter(Boolean).slice(0, 9)
      : []

    const urls = fileIds
      .map(fid => tempUrlMap.get(fid) || fid)
      .filter(Boolean)
      .slice(0, 9)

    const createdAt = Number(e.createdAt || 0)
    const item = {
      id: e._id,
      text: e.contentText || '',
      images: urls,
      createdAt,
      date: dayKey(createdAt),
      likeCount: likeCount.get(e._id) || 0,
      liked: likedSet.has(e._id),
      commentCount: commentCount.get(e._id) || 0
    }

    const moodLevel = normalizeMoodLevel(e.mood_level)
    if (moodLevel) item.mood_level = moodLevel

    return item
  })

  const dedupedItems = []
  const itemSeen = new Set()
  for (const item of items) {
    const id = String(item.id || '')
    if (!id || itemSeen.has(id)) continue
    itemSeen.add(id)
    dedupedItems.push(item)
  }

  const createdList = dedupedItems.map(x => Number(x.createdAt || 0)).filter(n => Number.isFinite(n) && n > 0)
  const olderCursor = createdList.length ? Math.min(...createdList) : range.fallbackOlderCursor
  const newerCursor = createdList.length ? Math.max(...createdList) : range.fallbackNewerCursor

  return {
    ok: true,
    items: dedupedItems,
    olderCursor,
    newerCursor,
    anchorDate
  }
}
