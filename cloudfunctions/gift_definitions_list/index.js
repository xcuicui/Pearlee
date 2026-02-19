const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function getRel(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function partnerOpenidFromRel(rel, myOpenid) {
  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  return members.find(x => x && x !== myOpenid) || ''
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

  const view = String(event.view || '').trim()
  if (view !== 'toMe' && view !== 'sentByMe') {
    throw new BizError('参数不正确', 'INVALID_PARAM')
  }

  const includeInactive = !!event.includeInactive
  const relationshipId = String(rel._id)
  const partnerOpenid = partnerOpenidFromRel(rel, OPENID)

  const where = {
    space_id: relationshipId,
    is_deleted: _.neq(true)
  }

  if (!includeInactive) where.is_active = true

  if (view === 'toMe') {
    where.recipient_user_id = OPENID
  } else {
    if (!partnerOpenid) return { ok: true, gifts: [] }
    where.created_by_user_id = OPENID
    where.recipient_user_id = partnerOpenid
  }

  const q = await db.collection('gift_definitions')
    .where(where)
    .orderBy('updated_at', 'desc')
    .get()

  return {
    ok: true,
    gifts: (q.data || []).map(item => toGiftOutput(item, OPENID))
  }
}
