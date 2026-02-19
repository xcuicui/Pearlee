const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const VALID_RARITY = new Set(['common', 'occasional', 'rare'])

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function toText(v) {
  return String(v || '').trim()
}

function assertInRelationship(rel, openid) {
  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  if (!members.includes(openid)) {
    throw new BizError('参数不正确', 'INVALID_PARAM')
  }
}

function normalizeIsActive(value, fallback) {
  if (typeof value === 'boolean') return value
  return fallback
}

function toGiftOutput(doc, currentOpenid) {
  return {
    id: String(doc._id),
    space_id: String(doc.space_id || ''),
    title: String(doc.title || ''),
    description: String(doc.description || ''),
    rarity: String(doc.rarity || 'occasional'),
    recipient_user_id: String(doc.recipient_user_id || ''),
    created_by_user_id: String(doc.created_by_user_id || ''),
    is_active: !!doc.is_active,
    is_deleted: !!doc.is_deleted,
    created_at: Number(doc.created_at || 0),
    updated_at: Number(doc.updated_at || 0),
    deleted_at: doc.deleted_at ? Number(doc.deleted_at) : null,
    can_delete: String(doc.created_by_user_id || '') === String(currentOpenid || '')
  }
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const id = toText(event.id)
  const title = toText(event.title)
  const description = toText(event.description)
  const rarity = toText(event.rarity)
  const recipientUserId = toText(event.recipient_user_id)
  const relationshipId = String(rel._id)

  if (!title || title.length > 12) throw new BizError('礼物名称需为 1-12 字', 'INVALID_PARAM')
  if (description.length > 40) throw new BizError('礼物描述最多 40 字', 'INVALID_PARAM')
  if (!VALID_RARITY.has(rarity)) throw new BizError('请选择有效稀有度', 'INVALID_PARAM')
  if (!recipientUserId) throw new BizError('请选择送给谁', 'INVALID_PARAM')
  assertInRelationship(rel, recipientUserId)

  const ts = now()

  if (!id) {
    const doc = {
      space_id: relationshipId,
      title,
      description,
      rarity,
      recipient_user_id: recipientUserId,
      created_by_user_id: OPENID,
      is_active: normalizeIsActive(event.is_active, true),
      is_deleted: false,
      created_at: ts,
      updated_at: ts,
      deleted_at: null
    }
    const res = await db.collection('gift_definitions').add({ data: doc })
    return { ok: true, gift: toGiftOutput({ _id: res._id, ...doc }, OPENID) }
  }

  const hitRes = await db.collection('gift_definitions').doc(id).get()
  const hit = hitRes && hitRes.data ? hitRes.data : null
  if (!hit) throw new BizError('礼物不存在', 'NOT_FOUND')
  if (String(hit.space_id || '') !== relationshipId) throw new BizError('无权限', 'FORBIDDEN')
  if (String(hit.created_by_user_id || '') !== OPENID) throw new BizError('无权限', 'FORBIDDEN')
  if (hit.is_deleted) throw new BizError('礼物不存在', 'NOT_FOUND')

  await db.collection('gift_definitions').doc(id).update({
    data: {
      title,
      description,
      rarity,
      recipient_user_id: recipientUserId,
      created_by_user_id: OPENID,
      is_active: normalizeIsActive(event.is_active, !!hit.is_active),
      updated_at: ts
    }
  })

  const nextRes = await db.collection('gift_definitions').doc(id).get()
  return { ok: true, gift: toGiftOutput(nextRes.data || {}, OPENID) }
}
