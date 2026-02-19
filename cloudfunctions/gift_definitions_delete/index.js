const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

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

  const id = String(event.id || '').trim()
  if (!id) throw new BizError('参数不正确', 'INVALID_PARAM')

  const relationshipId = String(rel._id)
  const hitRes = await db.collection('gift_definitions').doc(id).get()
  const hit = hitRes && hitRes.data ? hitRes.data : null
  if (!hit) throw new BizError('礼物不存在', 'NOT_FOUND')
  if (String(hit.space_id || '') !== relationshipId) throw new BizError('无权限', 'FORBIDDEN')
  if (String(hit.created_by_user_id || '') !== OPENID) throw new BizError('无权限', 'FORBIDDEN')

  if (hit.is_deleted) return { ok: true }

  const ts = now()
  await db.collection('gift_definitions').doc(id).update({
    data: {
      is_deleted: true,
      deleted_at: ts,
      updated_at: ts
    }
  })

  return { ok: true }
}
