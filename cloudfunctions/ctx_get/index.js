const cloud = require('wx-server-sdk')
const { BizError } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRelationshipByMember(OPENID) {
  const q = await db.collection('relationships').where({
    memberOpenids: OPENID,
    archived: false
  }).limit(1).get()
  return (q.data || [])[0] || null
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const rel = await getRelationshipByMember(OPENID)
  if (!rel) {
    return { ok: true, relationship: null }
  }

  const memberNicknames = rel.memberNicknames && typeof rel.memberNicknames === 'object'
    ? rel.memberNicknames
    : {}

  return {
    ok: true,
    relationship: {
      id: rel._id,
      name: rel.name || '我们',
      nickname: String(memberNicknames[OPENID] || ''),
      startDate: rel.startDate || '',
      inviteCode: rel.inviteCode || '',
      memberOpenids: rel.memberOpenids || [],
      memberNicknames
    }
  }
}
