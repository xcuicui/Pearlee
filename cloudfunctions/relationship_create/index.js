const cloud = require('wx-server-sdk')
const { BizError, now, inviteCode } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function cleanName(s) {
  return String(s || '').trim().slice(0, 12) || '我们'
}

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

function validateRequiredNickname(raw) {
  const nickname = String(raw || '').trim()
  if (!nickname) throw new BizError('请填写你在这段关系里的名字', 'NICKNAME_EMPTY')
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

  const patch = {
    relationshipId,
    userOpenid,
    nicknameInRelationship: nickname,
    updatedAt: ts
  }

  if (hit && hit._id) {
    await db.collection('relationship_members').doc(hit._id).update({ data: patch })
    return
  }

  await db.collection('relationship_members').add({
    data: {
      ...patch,
      createdAt: ts
    }
  })
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  // if already in a relationship, return it
  const existingQ = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  const hit = (existingQ.data || [])[0]
  if (hit) {
    return { ok: true, id: hit._id, inviteCode: hit.inviteCode }
  }

  const name = cleanName(event.name)
  const startDate = event.startDate ? String(event.startDate) : ''
  const nickname = validateRequiredNickname(event.nickname)

  const ts = now()
  let code = inviteCode(8)

  // avoid collision
  for (let i = 0; i < 3; i++) {
    const q = await db.collection('relationships').where({ inviteCode: code }).limit(1).get()
    if ((q.data || []).length === 0) break
    code = inviteCode(8)
  }

  const res = await db.collection('relationships').add({
    data: {
      name,
      startDate,
      inviteCode: code,
      memberOpenids: [OPENID],
      archived: false,
      createdAt: ts,
      updatedAt: ts
    }
  })

  await upsertRelationshipMember(res._id, OPENID, nickname, ts)

  return { ok: true, id: res._id, inviteCode: code }
}
