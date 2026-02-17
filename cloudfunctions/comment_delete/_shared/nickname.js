async function loadRelationshipMembersMap(db, relationshipId) {
  const map = new Map()
  if (!relationshipId) return map

  try {
    const q = await db.collection('relationship_members')
      .where({ relationshipId })
      .limit(10)
      .get()

    for (const m of (q.data || [])) {
      const openid = String(m.userOpenid || '').trim()
      if (!openid) continue
      const nickname = (m.nicknameInRelationship == null) ? '' : String(m.nicknameInRelationship)
      map.set(openid, nickname)
    }
  } catch (e) {
    // best-effort
  }

  return map
}

function nicknameFallback(isMine) {
  return isMine ? '你' : '对方'
}

module.exports = { loadRelationshipMembersMap, nicknameFallback }
