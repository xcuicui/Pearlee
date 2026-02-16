const cloud = require('wx-server-sdk')
const { BizError, now, dayKey } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function cleanText(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim()
}

function pad2(n) { return String(n).padStart(2, '0') }
function parseYmd(s) {
  const m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}
function ymdDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
function addDaysYmd(s, delta) {
  const d = parseYmd(s)
  if (!d) return ''
  d.setDate(d.getDate() + delta)
  return ymdDate(d)
}

function normalizeImageItem(x) {
  if (!x) return null
  if (typeof x === 'string') {
    const url = String(x).trim()
    if (!url) return null
    return { url, width: 0, height: 0 }
  }
  if (typeof x === 'object') {
    const url = String(x.url || x.fileID || x.fileId || '').trim()
    if (!url) return null
    const width = Number(x.width || 0)
    const height = Number(x.height || 0)
    return {
      url,
      width: Number.isFinite(width) && width > 0 ? Math.floor(width) : 0,
      height: Number.isFinite(height) && height > 0 ? Math.floor(height) : 0
    }
  }
  return null
}

function cleanImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .map(normalizeImageItem)
    .filter(Boolean)
    .slice(0, 3)
}

async function hasAnyByDate(relationshipId, date) {
  const q = await db.collection('entries')
    .where(_.or([
      { relationshipId, isDeleted: false, date },
      { relationshipId, isDeleted: false, dayKey: date }
    ]))
    .limit(1)
    .get()
  return !!((q.data || [])[0])
}

async function calculateFullStreak(relationshipId, todayDate) {
  let cursor = todayDate
  let count = 0
  for (let i = 0; i < 3660; i++) {
    // eslint-disable-next-line no-await-in-loop
    const has = await hasAnyByDate(relationshipId, cursor)
    if (!has) break
    count += 1
    cursor = addDaysYmd(cursor, -1)
    if (!cursor) break
  }
  return count
}

async function updateRelationshipStats(relationshipId, todayDate, ts) {
  const q = await db.collection('relationship_stats').where({ relationshipId }).limit(1).get()
  const hit = (q.data || [])[0]
  if (!hit) {
    const current = await calculateFullStreak(relationshipId, todayDate)
    await db.collection('relationship_stats').add({
      data: {
        relationshipId,
        current_streak: current || 1,
        last_record_date: todayDate,
        created_at: ts,
        updated_at: ts
      }
    })
    return
  }

  const last = String(hit.last_record_date || '').trim()
  const prev = Number(hit.current_streak || 0)
  const yesterday = addDaysYmd(todayDate, -1)
  let next = prev > 0 ? prev : 1

  if (last === todayDate) {
    next = prev > 0 ? prev : 1
  } else if (last === yesterday) {
    next = (prev > 0 ? prev : 0) + 1
  } else {
    next = 1
  }

  await db.collection('relationship_stats').doc(hit._id).update({
    data: {
      current_streak: next,
      last_record_date: todayDate,
      updated_at: ts
    }
  })
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const text = cleanText(event.text)
  if (text && text.length > 500) throw new BizError('最多 500 字', 'TOO_LONG')
  if (Array.isArray(event.images) && event.images.length > 3) {
    throw new BizError('最多 3 张图片', 'TOO_MANY_IMAGES')
  }
  const images = cleanImages(event.images)
  if (!text && images.length === 0) throw new BizError('写点什么吧', 'EMPTY')

  const ts = now()
  const date = dayKey(ts)
  const res = await db.collection('entries').add({
    data: {
      relationshipId: rel._id,
      userOpenid: OPENID,
      contentText: text,
      images,
      createdAt: ts,
      updatedAt: ts,
      date,
      dayKey: date,
      isDeleted: false
    }
  })

  await updateRelationshipStats(rel._id, date, ts)

  return { ok: true, id: res._id }
}
