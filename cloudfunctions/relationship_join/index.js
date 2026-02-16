const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function hasEmoji(input) {
  return /[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(input)
}

function isPlaceholderNickname(input) {
  const v = String(input || '').trim()
  return v === '你' || v === '对方' || v.toUpperCase() === 'TA'
}

function charLen(input) {
  return Array.from(input).length
}

function validateOptionalNickname(raw) {
  if (typeof raw === 'undefined' || raw === null) return null
  const nickname = String(raw).trim()
  if (!nickname) return null
  if (charLen(nickname) > 10) throw new BizError('昵称最多 10 个字', 'NICKNAME_TOO_LONG')
  if (isPlaceholderNickname(nickname)) throw new BizError('昵称不能使用占位词', 'NICKNAME_INVALID_CHAR')
  if (hasEmoji(nickname)) throw new BizError('昵称不能包含表情符号', 'NICKNAME_INVALID_CHAR')
  return nickname
}

async function upsertRelationshipMember(relationshipId, userOpenid, nickname, ts) {
  const q = await db.collection('relationship_members')
    .where({ relationshipId, userOpenid })
    .limit(1)
    .get()
  const hit = (q.data || [])[0]

  if (hit && hit._id) {
    const patch = { updatedAt: ts }
    if (nickname !== null) patch.nicknameInRelationship = nickname
    await db.collection('relationship_members').doc(hit._id).update({ data: patch })
    return
  }

  await db.collection('relationship_members').add({
    data: {
      relationshipId,
      userOpenid,
      nicknameInRelationship: nickname === null ? null : nickname,
      createdAt: ts,
      updatedAt: ts
    }
  })
}

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
  const nickname = validateOptionalNickname(event.nickname)
  const ts = now()

  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  if (members.includes(OPENID)) {
    await upsertRelationshipMember(rel._id, OPENID, nickname, ts)
    return { ok: true, id: rel._id }
  }

  if (members.length >= 2) throw new BizError('该关系已满员', 'FULL')

  await db.collection('relationships').doc(rel._id).update({
    data: {
      memberOpenids: db.command.push([OPENID]),
      updatedAt: ts
    }
  })

  await upsertRelationshipMember(rel._id, OPENID, nickname, ts)

  return { ok: true, id: rel._id }
}
