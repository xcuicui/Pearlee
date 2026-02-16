const cloud = require('wx-server-sdk')
const { BizError, now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getMine(OPENID) {
  const q = await db.collection('relationships').where({ memberOpenids: OPENID, archived: false }).limit(1).get()
  return (q.data || [])[0] || null
}

function cleanName(s) {
  const name = String(s || '').trim()
  return name ? name.slice(0, 12) : '我们'
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

function cleanStartDate(s) {
  const v = String(s || '').trim()
  if (!v) return ''
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''
}

async function upsertRelationshipMember(relationshipId, userOpenid, nickname, ts) {
  const q = await db.collection('relationship_members')
    .where({ relationshipId, userOpenid })
    .limit(1)
    .get()
  const hit = (q.data || [])[0]

  if (hit && hit._id) {
    await db.collection('relationship_members').doc(hit._id).update({
      data: {
        nicknameInRelationship: nickname,
        updatedAt: ts
      }
    })
    return
  }

  await db.collection('relationship_members').add({
    data: {
      relationshipId,
      userOpenid,
      nicknameInRelationship: nickname,
      createdAt: ts,
      updatedAt: ts
    }
  })
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getMine(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const ts = now()
  const patch = {}

  if (Object.prototype.hasOwnProperty.call(event, 'name')) patch.name = cleanName(event.name)
  if (Object.prototype.hasOwnProperty.call(event, 'startDate')) patch.startDate = cleanStartDate(event.startDate)
  if (Object.prototype.hasOwnProperty.call(event, 'nickname')) {
    const nickname = validateRequiredNickname(event.nickname)
    await upsertRelationshipMember(rel._id, OPENID, nickname, ts)
  }

  patch.updatedAt = ts
  await db.collection('relationships').doc(rel._id).update({ data: patch })

  return { ok: true }
}
