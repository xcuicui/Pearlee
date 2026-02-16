const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRelationshipByMember(OPENID) {
  const q = await db.collection('relationships').where({
    memberOpenids: OPENID,
    archived: false
  }).limit(1).get()
  return (q.data || [])[0] || null
}

function partnerOpenidFromRel(rel, myOpenid) {
  const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
  return members.find(x => x && x !== myOpenid) || ''
}

async function getMemberNicknameMap(relationshipId, openids) {
  const ids = Array.from(new Set((Array.isArray(openids) ? openids : []).filter(Boolean)))
  if (!ids.length) return {}

  const q = await db.collection('relationship_members')
    .where({ relationshipId, userOpenid: db.command.in(ids) })
    .limit(ids.length)
    .get()

  const map = {}
  for (const item of (q.data || [])) {
    if (!item || !item.userOpenid) continue
    map[item.userOpenid] = String(item.nicknameInRelationship || '').trim()
  }
  return map
}

function resolveNickname(openid, isSelf, memberNicknames, legacyNicknames) {
  const raw = rawNickname(openid, memberNicknames, legacyNicknames)
  if (raw) return raw

  return isSelf ? '你' : '对方'
}

function rawNickname(openid, memberNicknames, legacyNicknames) {
  const current = String((memberNicknames && memberNicknames[openid]) || '').trim()
  if (current) return current
  const legacy = String((legacyNicknames && legacyNicknames[openid]) || '').trim()
  if (legacy) return legacy
  return ''
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRelationshipByMember(OPENID)
  if (!rel) {
    return { ok: true, relationship: null }
  }

  const partnerOpenid = partnerOpenidFromRel(rel, OPENID)
  const memberNicknames = await getMemberNicknameMap(rel._id, [OPENID, partnerOpenid])
  const legacyNicknames = rel.memberNicknames && typeof rel.memberNicknames === 'object'
    ? rel.memberNicknames
    : {}

  const meNickname = resolveNickname(OPENID, true, memberNicknames, legacyNicknames)
  const partnerNickname = partnerOpenid
    ? resolveNickname(partnerOpenid, false, memberNicknames, legacyNicknames)
    : '对方'
  const meNicknameRaw = rawNickname(OPENID, memberNicknames, legacyNicknames)
  const partnerNicknameRaw = partnerOpenid
    ? rawNickname(partnerOpenid, memberNicknames, legacyNicknames)
    : ''

  return {
    ok: true,
    relationship: {
      id: rel._id,
      name: rel.name || '我们',
      nickname: meNickname,
      startDate: rel.startDate || '',
      inviteCode: rel.inviteCode || '',
      memberOpenids: rel.memberOpenids || [],
      me: {
        openid: OPENID,
        nickname: meNickname,
        nicknameRaw: meNicknameRaw
      },
      partner: {
        openid: partnerOpenid,
        nickname: partnerNickname,
        nicknameRaw: partnerNicknameRaw
      }
    }
  }
}
