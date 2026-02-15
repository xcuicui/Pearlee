const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const REQUIRED_COLLECTIONS = ['users', 'relationships', 'entries', 'likes', 'comments']

function isCollectionMissingError(err) {
  const msg = ((err && err.message) || (err && err.errMsg) || '').toLowerCase()
  return msg.includes('collection') && (
    msg.includes('not exist') ||
    msg.includes('does not exist') ||
    msg.includes('不存在')
  )
}

function toErrorMessage(err) {
  return (err && (err.message || err.errMsg)) || 'unknown error'
}

async function checkCollection(name) {
  try {
    await db.collection(name).limit(1).get()
    return { name, exists: true }
  } catch (err) {
    if (isCollectionMissingError(err)) return { name, exists: false, reason: toErrorMessage(err) }
    return { name, exists: false, reason: toErrorMessage(err), checkFailed: true }
  }
}

exports.main = async () => {
  const checks = await Promise.all(REQUIRED_COLLECTIONS.map(checkCollection))
  const missingCollections = checks.filter(x => !x.exists).map(x => x.name)
  return {
    ok: missingCollections.length === 0,
    missingCollections,
    checks
  }
}
