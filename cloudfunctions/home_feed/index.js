const cloud = require('wx-server-sdk')
const { BizError, dayKey } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function pad2(n) { return String(n).padStart(2, '0') }
function ymd(y, m, d) { return `${y}-${pad2(m)}-${pad2(d)}` }

function monthRange(year, month) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  return {
    startTs: start.getTime(),
    endTs: end.getTime()
  }
}

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

async function listMonthEntries(relId, startTs, endTs) {
  const where = {
    relationshipId: relId,
    isDeleted: false,
    createdAt: db.command.gte(startTs).and(db.command.lt(endTs))
  }
  const q = await db.collection('entries')
    .where(where)
    .orderBy('createdAt', 'asc')
    .limit(1000)
    .get()
  return q.data || []
}

function buildMarks(entries) {
  const map = {}
  const byDay = new Map()

  for (const e of entries) {
    const k = e.dayKey || dayKey(e.createdAt)
    if (!byDay.has(k)) byDay.set(k, new Set())
    byDay.get(k).add(e.userOpenid)
  }

  for (const [k, set] of byDay.entries()) {
    const level = set.size >= 2 ? 2 : 1
    map[k] = { level }
  }

  return map
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

async function getEmotion(relId, myOpenid, partnerOpenid) {
  // Priority (simplified MVP):
  // 1) partner entry within last 3 days
  // 2) random past entry
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
      return {
        empty: false,
        entryId: hit._id,
        date: hit.dayKey || dayKey(hit.createdAt),
        timeText: formatTime(hit.createdAt),
        text: hit.contentText || '',
        from: 'TA'
      }
    }
  }

  const anyQ = await db.collection('entries')
    .where({ relationshipId: relId, isDeleted: false })
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get()
  const list = anyQ.data || []
  if (!list.length) return { empty: true }

  const pick = list[Math.floor(Math.random() * list.length)]
  return {
    empty: false,
    entryId: pick._id,
    date: pick.dayKey || dayKey(pick.createdAt),
    timeText: formatTime(pick.createdAt),
    text: pick.contentText || '',
    from: pick.userOpenid === myOpenid ? '你' : 'TA'
  }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) {
    return { ok: true, relationshipId: '' }
  }

  const year = Number(event.year) || new Date().getFullYear()
  const month = Number(event.month) || (new Date().getMonth() + 1)

  const { startTs, endTs } = monthRange(year, month)
  const entries = await listMonthEntries(rel._id, startTs, endTs)
  const marks = buildMarks(entries)

  const partnerOpenid = pickPartner(rel, OPENID)
  const emotion = await getEmotion(rel._id, OPENID, partnerOpenid)

  const todayKey = dayKey(Date.now())
  const todayHasAny = entries.some(x => (x.dayKey || dayKey(x.createdAt)) === todayKey)

  return {
    ok: true,
    relationshipId: rel._id,
    relationshipName: rel.name || '我们',
    startDate: rel.startDate || '',
    marks,
    emotion,
    today: { key: todayKey, hasAny: todayHasAny }
  }
}
