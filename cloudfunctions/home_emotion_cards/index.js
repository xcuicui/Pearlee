const cloud = require('wx-server-sdk')

function pad2(n) { return String(n).padStart(2, '0') }
function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function pad2(n) { return String(n).padStart(2, '0') }
function formatTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}

function entryDate(e) {
  return e.date || e.dayKey || dayKey(e.createdAt)
}

function pickPartner(rel, myOpenid) {
  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  return members.find(x => x && x !== myOpenid) || ''
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

async function queryLatestWithinDays(relId, openid, days) {
  if (!openid) return null
  const startTs = Date.now() - Math.max(0, Number(days || 0)) * 86400000
  const q = await db.collection('entries')
    .where({
      relationshipId: relId,
      userOpenid: openid,
      isDeleted: false,
      createdAt: db.command.gte(startTs)
    })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()
  return (q.data || [])[0] || null
}

async function listOlderEntries(relId, beforeTs, limit) {
  const q = await db.collection('entries')
    .where({
      relationshipId: relId,
      isDeleted: false,
      createdAt: db.command.lt(beforeTs)
    })
    .orderBy('createdAt', 'desc')
    .limit(Math.max(limit, 1))
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

function dedupeByEntryId(entries) {
  const out = []
  const seen = new Set()
  for (const e of entries) {
    const id = e && e._id ? String(e._id) : ''
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(e)
  }
  return out
}

function pickRandom(items, size) {
  const arr = Array.isArray(items) ? items.slice() : []
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.slice(0, Math.max(0, size))
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const limit = Math.max(1, Math.min(10, Number(event.limit || 3)))

  const rel = await getRel(OPENID)
  if (!rel) {
    return { ok: true, relationshipId: '', cards: [] }
  }

  const relId = rel._id
  const partnerOpenid = pickPartner(rel, OPENID)

  const now = Date.now()
  const threeDaysAgo = now - 3 * 86400000

  const [partnerRecent, myRecent, olderEntries] = await Promise.all([
    queryLatestWithinDays(relId, partnerOpenid, 3),
    queryLatestWithinDays(relId, OPENID, 3),
    listOlderEntries(relId, threeDaysAgo, 100)
  ])

  const selectedEntries = []
  if (partnerRecent) selectedEntries.push(partnerRecent)
  if (myRecent) selectedEntries.push(myRecent)

  const dedupedSeed = dedupeByEntryId(selectedEntries)
  const remaining = Math.max(0, limit - dedupedSeed.length)
  const seedIds = new Set(dedupedSeed.map((x) => String(x && x._id ? x._id : '')))
  const olderDeduped = dedupeByEntryId(olderEntries).filter((x) => {
    const id = String(x && x._id ? x._id : '')
    return !!id && !seedIds.has(id)
  })
  const randomOlder = pickRandom(olderDeduped, remaining)
  const finalEntries = dedupeByEntryId(dedupedSeed.concat(randomOlder)).slice(0, limit)

  const cards = []
  for (const entry of finalEntries) {
    cards.push(await toCardItem(entry, OPENID))
  }

  return { ok: true, relationshipId: relId, cards }
}
