const cloud = require('wx-server-sdk')

function pad2(n) { return String(n).padStart(2, '0') }
function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function formatTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}

function entryDate(e) {
  return e.date || e.dayKey || dayKey(e.createdAt)
}

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

async function toTempUrl(fileId) {
  const fid = String(fileId || '').trim()
  if (!fid) return ''
  try {
    const res = await cloud.getTempFileURL({ fileList: [fid] })
    const x = res && res.fileList && res.fileList[0]
    return (x && x.tempFileURL) ? String(x.tempFileURL) : ''
  } catch (e) {
    console.log('[home_emotion_cards] getTempFileURL failed:', e)
    return ''
  }
}

function imageFileId(v) {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    return v.url || v.fileID || v.fileId || ''
  }
  return ''
}

async function mapImagesToUrls(images) {
  const out = []
  const src = Array.isArray(images) ? images : []
  for (const x of src) {
    const raw = String(imageFileId(x) || '').trim()
    if (!raw) continue
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      out.push(raw)
      continue
    }
    if (raw.startsWith('cloud://')) {
      const temp = await toTempUrl(raw)
      out.push(temp || raw)
    }
  }
  return out
}

async function listRecentEntries(relId, limit) {
  const q = await db.collection('entries')
    .where({
      relationshipId: relId,
      isDeleted: false
    })
    .orderBy('createdAt', 'desc')
    .limit(Math.max(1, Number(limit || 1)))
    .get()
  return q.data || []
}

function toCardBase(entry, myOpenid) {
  const isSelf = entry && entry.userOpenid === myOpenid
  return {
    id: entry && entry._id ? String(entry._id) : '',
    entryId: entry && entry._id ? String(entry._id) : '',
    date: entryDate(entry),
    timeText: formatTime(entry && entry.createdAt),
    text: (entry && entry.contentText) || '',
    from: isSelf ? '你' : '对方',
    images: [],
    coverImage: ''
  }
}

async function toCardItem(entry, myOpenid) {
  const base = toCardBase(entry, myOpenid)
  const imgs = (await mapImagesToUrls(entry && entry.images)).slice(0, 9)
  base.images = imgs
  base.coverImage = imgs[0] || ''
  return base
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const limit = Math.max(1, Math.min(10, Number(event.limit || 3)))

  const rel = await getRel(OPENID)
  if (!rel) {
    return { ok: true, relationshipId: '', cards: [] }
  }

  const relId = rel._id
  const finalEntries = await listRecentEntries(relId, limit)

  const cards = []
  for (const entry of finalEntries) {
    cards.push(await toCardItem(entry, OPENID))
  }

  return { ok: true, relationshipId: relId, cards }
}
