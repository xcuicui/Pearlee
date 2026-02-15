const cloud = require('wx-server-sdk')
const { BizError, now, dayKey } = require('../_shared')

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

  const text = cleanText(event.text)
  if (!text) throw new BizError('写点什么吧', 'EMPTY')
  if (text.length > 500) throw new BizError('最多 500 字', 'TOO_LONG')

  const ts = now()
  const res = await db.collection('entries').add({
    data: {
      relationshipId: rel._id,
      userOpenid: OPENID,
      contentText: text,
      images: [],
      createdAt: ts,
      updatedAt: ts,
      dayKey: dayKey(ts),
      isDeleted: false
    }
  })

  return { ok: true, id: res._id }
}
