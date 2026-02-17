const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const commentId = String(event.commentId || '').trim()
  if (!commentId) throw new BizError('缺少 commentId', 'MISSING_ID')

  const q = await db.collection('comments').doc(commentId).get()
  const c = q && q.data
  if (!c) throw new BizError('评论不存在', 'COMMENT_NOT_FOUND')

  if (String(c.relationshipId || '') !== String(rel._id || '')) throw new BizError('无权限', 'FORBIDDEN')
  if (String(c.userOpenid || '') !== String(OPENID || '')) throw new BizError('无权限', 'FORBIDDEN')

  await db.collection('comments').doc(commentId).remove()

  return { ok: true }
}
