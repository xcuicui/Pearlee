const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')
const { loadRelationshipMembersMap, nicknameFallback } = require('./_shared/nickname')

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
  if (!content) throw new BizError('写点什么再发送', 'COMMENT_EMPTY')
  if (content.length > 200) throw new BizError('最多 200 字', 'COMMENT_TOO_LONG')

  const entryQ = await db.collection('entries').doc(entryId).get()
  const entry = entryQ && entryQ.data
  if (!entry || entry.isDeleted) throw new BizError('记录不存在', 'ENTRY_NOT_FOUND')
  if (entry.relationshipId !== rel._id) throw new BizError('无权限', 'FORBIDDEN')

  const ts = now()
  const addRes = await db.collection('comments').add({
    data: {
      entryId,
      relationshipId: rel._id,
      userOpenid: OPENID,
      content,
      createdAt: ts
    }
  })

  const members = await loadRelationshipMembersMap(db, rel._id)
  const isMine = true
  const authorNickname = (members.get(OPENID) || '').trim() || nicknameFallback(isMine)

  return {
    ok: true,
    comment: {
      id: addRes._id,
      entryId,
      userOpenid: OPENID,
      authorNickname,
      content,
      createdAt: ts,
      isMine
    }
  }
}
