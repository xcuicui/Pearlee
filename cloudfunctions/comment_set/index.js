const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function cleanText(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim()
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const entryId = String(event.entryId || '').trim()
  const content = cleanText(event.content)
  if (!entryId) throw new BizError('缺少 entryId', 'MISSING_ID')
  if (!content) throw new BizError('写点回应吧', 'EMPTY')
  if (content.length > 120) throw new BizError('回应最多 120 字', 'TOO_LONG')

  const entryQ = await db.collection('entries').doc(entryId).get()
  const entry = entryQ && entryQ.data
  if (!entry || entry.isDeleted) throw new BizError('记录不存在', 'NOT_FOUND')
  if (entry.relationshipId !== rel._id) throw new BizError('无权限', 'FORBIDDEN')

  // MVP: each entry allows only ONE comment total.
  const existingQ = await db.collection('comments').where({ entryId }).limit(1).get()
  const hit = (existingQ.data || [])[0]
  if (hit) throw new BizError('这条记录已有回应', 'ALREADY_COMMENTED')

  const ts = now()
  const res = await db.collection('comments').add({
    data: {
      entryId,
      userOpenid: OPENID,
      content,
      createdAt: ts
    }
  })

  return { ok: true, id: res._id }
}
