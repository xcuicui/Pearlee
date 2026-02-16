const cloud = require('wx-server-sdk')
const { dayKey } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function pad2(n) { return String(n).padStart(2, '0') }
function ymd(y, m, d) { return `${y}-${pad2(m)}-${pad2(d)}` }
function ymdDate(d) { return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()) }
function parseYmd(s) {
  const m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  return d
}
function addDaysYmd(s, delta) {
  const d = parseYmd(s)
  if (!d) return ''
  d.setDate(d.getDate() + delta)
  return ymdDate(d)
}
function startOfWeekMonday(input) {
  const d = input ? new Date(input) : new Date()
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay() // 0:Sun ... 6:Sat
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}
function weekFromStart(weekStart) {
  const startDate = parseYmd(weekStart) || startOfWeekMonday()
  const start = ymdDate(startDate)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate.getTime())
    d.setDate(d.getDate() + i)
    days.push(ymdDate(d))
  }
  return { start, days }
}

function dayRange(dateYmd) {
  const start = parseYmd(dateYmd)
  if (!start) return { startTs: 0, endTs: 0 }
  const end = new Date(start.getTime())
  end.setDate(end.getDate() + 1)
  return {
    startTs: start.getTime(),
    endTs: end.getTime()
  }
}

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

async function getMemberNicknameMap(relationshipId, openids) {
  const ids = Array.from(new Set((Array.isArray(openids) ? openids : []).filter(Boolean)))
  if (!ids.length) return {}

  const q = await db.collection('relationship_members')
    .where({ relationshipId, userOpenid: db.command.in(ids) })
    .limit(ids.length)
    .get()

  const map = {}
  for (const item of (q.data || [])) {
    if (!item || !item.userOpenid) continue
    map[item.userOpenid] = String(item.nicknameInRelationship || '').trim()
  }
  return map
}

async function listEntriesByCreatedAt(relId, startTs, endTs, limit = 1000) {
  const where = {
    relationshipId: relId,
    isDeleted: false,
    createdAt: db.command.gte(startTs).and(db.command.lt(endTs))
  }
  const q = await db.collection('entries')
    .where(where)
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get()
  return q.data || []
}

async function hasAnyEntryByDate(relId, dateYmd) {
  const where = db.command.or([
    { relationshipId: relId, isDeleted: false, date: dateYmd },
    { relationshipId: relId, isDeleted: false, dayKey: dateYmd }
  ])
  const q = await db.collection('entries').where(where).limit(1).get()
  return !!((q.data || [])[0])
}

function entryDate(e) {
  return e.date || e.dayKey || dayKey(e.createdAt)
}

function buildWeekMarks(entries) {
  const activeDates = []
  const levelByDate = {}
  const byDay = new Map()

  for (const e of entries) {
    const k = entryDate(e)
    if (!byDay.has(k)) byDay.set(k, new Set())
    byDay.get(k).add(e.userOpenid)
  }

  for (const [k, set] of byDay.entries()) {
    const level = set.size >= 2 ? 2 : 1
    activeDates.push(k)
    levelByDate[k] = level
  }

  return { activeDates, levelByDate }
}

function pickPartner(rel, myOpenid) {
  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  return members.find(x => x && x !== myOpenid) || ''
}

function formatTime(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}

async function toTempUrl(fileId) {
  const fid = String(fileId || '').trim()
  if (!fid) return ''
  try {
    const res = await cloud.getTempFileURL({ fileList: [fid] })
    const x = res && res.fileList && res.fileList[0]
    return (x && x.tempFileURL) ? String(x.tempFileURL) : ''
  } catch (e) {
    console.log('[home_feed] getTempFileURL failed:', e)
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
      continue
    }
  }
  return out
}

async function getEmotion(relId, myOpenid, partnerOpenid, myNickname, partnerNickname) {
  const now = Date.now()
  const threeDaysAgo = now - 3 * 86400000

  if (partnerOpenid) {
    const q = await db.collection('entries')
      .where({ relationshipId: relId, userOpenid: partnerOpenid, isDeleted: false, createdAt: db.command.gte(threeDaysAgo) })
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()

    const hit = (q.data || [])[0]
    if (hit) {
      const imgs = await mapImagesToUrls(hit.images)
      return {
        empty: false,
        entryId: hit._id,
        date: entryDate(hit),
        timeText: formatTime(hit.createdAt),
        text: hit.contentText || '',
        from: partnerNickname || '对方',
        images: imgs,
        coverImage: imgs[0] || ''
      }
    }
  }

  const histQ = await db.collection('entries')
    .where({
      relationshipId: relId,
      isDeleted: false,
      createdAt: db.command.lt(threeDaysAgo)
    })
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()
  const list = histQ.data || []
  if (!list.length) return { empty: true }

  const pick = list[Math.floor(Math.random() * list.length)]
  const imgs = await mapImagesToUrls(pick.images)
  return {
    empty: false,
    entryId: pick._id,
    date: entryDate(pick),
    timeText: formatTime(pick.createdAt),
    text: pick.contentText || '',
    from: pick.userOpenid === myOpenid ? (myNickname || '你') : (partnerNickname || '对方'),
    images: imgs,
    coverImage: imgs[0] || ''
  }
}

async function getStreak(relId) {
  const q = await db.collection('relationship_stats').where({ relationshipId: relId }).limit(1).get()
  const hit = (q.data || [])[0] || {}
  const current = Number(hit.current_streak || 0)
  return {
    current: current > 0 ? current : 0,
    lastRecordDate: hit.last_record_date || '',
    visible: current >= 2
  }
}

function calcDays(startDate) {
  const d = parseYmd(startDate)
  if (!d) return 1
  const s = d.setHours(0, 0, 0, 0)
  const nowDate = new Date()
  const n = nowDate.setHours(0, 0, 0, 0)
  return Math.floor((n - s) / 86400000) + 1
}

function resolveNickname(openid, isSelf, memberNicknames, legacyNicknames) {
  const current = String((memberNicknames && memberNicknames[openid]) || '').trim()
  if (current) return current

  const legacy = String((legacyNicknames && legacyNicknames[openid]) || '').trim()
  if (legacy) return legacy

  return isSelf ? '你' : '对方'
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) {
    return { ok: true, relationshipId: '' }
  }

  const week = weekFromStart(event.weekStart)
  const weekEnd = addDaysYmd(week.start, 7)
  const { startTs } = dayRange(week.start)
  const weekEndDate = parseYmd(weekEnd)
  const endTs = weekEndDate ? weekEndDate.getTime() : startTs
  const weekEntries = await listEntriesByCreatedAt(rel._id, startTs, endTs)
  const marks = buildWeekMarks(weekEntries)

  const partnerOpenid = pickPartner(rel, OPENID)
  const memberNicknames = await getMemberNicknameMap(rel._id, [OPENID, partnerOpenid])
  const legacyNicknames = rel.memberNicknames && typeof rel.memberNicknames === 'object'
    ? rel.memberNicknames
    : {}
  const myNickname = resolveNickname(OPENID, true, memberNicknames, legacyNicknames)
  const partnerNickname = partnerOpenid
    ? resolveNickname(partnerOpenid, false, memberNicknames, legacyNicknames)
    : '对方'

  const [emotion, streak] = await Promise.all([
    getEmotion(rel._id, OPENID, partnerOpenid, myNickname, partnerNickname),
    getStreak(rel._id)
  ])

  const todayKey = dayKey(Date.now())
  const todayHasAny = await hasAnyEntryByDate(rel._id, todayKey)

  return {
    ok: true,
    relationshipId: rel._id,
    relationshipName: rel.name || '我们',
    startDate: rel.startDate || '',
    nickname: partnerNickname,
    myNickname,
    partnerNickname,
    daysSinceStart: rel.startDate ? calcDays(rel.startDate) : 1,
    streak,
    week: {
      start: week.start,
      days: week.days,
      activeDates: marks.activeDates,
      levelByDate: marks.levelByDate,
      todayKey
    },
    emotion,
    today: { key: todayKey, hasAny: todayHasAny }
  }
}
