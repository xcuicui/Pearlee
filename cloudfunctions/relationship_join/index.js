const cloud = require('wx-server-sdk')
const { BizError, now } = require('../_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const inviteCode = String(event.inviteCode || '').trim().toUpperCase()
  if (!inviteCode) throw new BizError('邀请码不能为空', 'EMPTY_CODE')

  // If already in relationship, just return.
  const existingQ = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  const hit = (existingQ.data || [])[0]
  if (hit) return { ok: true, id: hit._id }

  const relQ = await db.collection('relationships').where({ inviteCode, archived: false }).limit(1).get()
  const rel = (relQ.data || [])[0]
  if (!rel) throw new BizError('邀请码无效', 'INVALID_CODE')

  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  if (members.includes(OPENID)) return { ok: true, id: rel._id }

  if (members.length >= 2) throw new BizError('该关系已满员', 'FULL')

  await db.collection('relationships').doc(rel._id).update({
    data: {
      memberOpenids: db.command.push([OPENID]),
      updatedAt: now()
    }
  })

  return { ok: true, id: rel._id }
}
