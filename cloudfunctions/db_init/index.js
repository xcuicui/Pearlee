const cloud = require('wx-server-sdk')
const { now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const INIT_VERSION = '2026-02-15'

const REQUIRED_COLLECTIONS = ['users', 'relationships', 'entries', 'likes', 'comments', 'relationship_stats']

const REQUIRED_INDEXES = {
  relationships: [
    { name: 'idx_inviteCode', keys: { inviteCode: 1 } },
    { name: 'idx_memberOpenids_archived', keys: { memberOpenids: 1, archived: 1 } }
  ],
  relationship_stats: [
    { name: 'idx_relationshipId', keys: { relationshipId: 1 } }
  ],
  entries: [
    { name: 'idx_relationshipId_createdAt', keys: { relationshipId: 1, createdAt: -1 } },
    { name: 'idx_relationshipId_dayKey_createdAt', keys: { relationshipId: 1, dayKey: 1, createdAt: 1 } },
    { name: 'idx_relationshipId_date_createdAt', keys: { relationshipId: 1, date: 1, createdAt: 1 } }
  ],
  likes: [
    { name: 'idx_entryId_createdAt', keys: { entryId: 1, createdAt: -1 } },
    { name: 'idx_entryId_userOpenid', keys: { entryId: 1, userOpenid: 1 } }
  ],
  comments: [
    { name: 'idx_entryId_createdAt', keys: { entryId: 1, createdAt: -1 } }
  ]
}

function toErrorMessage(err) {
  return (err && (err.message || err.errMsg)) || 'unknown error'
}

function isCollectionMissingError(err) {
  const msg = toErrorMessage(err).toLowerCase()
  return msg.includes('collection') && (
    msg.includes('not exist') ||
    msg.includes('does not exist') ||
    msg.includes('不存在')
  )
}

function isIndexAlreadyExistsError(err) {
  const msg = toErrorMessage(err).toLowerCase()
  return msg.includes('already exists') || msg.includes('已存在') || msg.includes('index name conflict')
}

async function probeCollection(name) {
  try {
    await db.collection(name).limit(1).get()
    return { exists: true }
  } catch (err) {
    if (isCollectionMissingError(err)) return { exists: false, reason: toErrorMessage(err) }
    return { exists: false, reason: toErrorMessage(err), unknownError: true }
  }
}

async function tryCreateCollection(name) {
  if (typeof db.createCollection !== 'function') {
    return { supported: false, ok: false, reason: 'db.createCollection unavailable' }
  }

  try {
    await db.createCollection(name)
    return { supported: true, ok: true }
  } catch (err) {
    return { supported: true, ok: false, reason: toErrorMessage(err) }
  }
}

async function ensureCollectionByDummyWrite(name) {
  const dummyData = { __dbInitDummy: true, createdAt: now() }
  const addRes = await db.collection(name).add({ data: dummyData })
  const docId = addRes && (addRes._id || addRes.id)

  if (docId) {
    try {
      await db.collection(name).doc(docId).remove()
      return { ok: true, docId, deleted: true }
    } catch (err) {
      return { ok: true, docId, deleted: false, deleteError: toErrorMessage(err) }
    }
  }

  return { ok: true, deleted: false, note: 'dummy write succeeded but doc id missing' }
}

async function ensureCollection(name) {
  const report = { name, existed: false, created: false, ok: false, strategy: 'probe' }

  const probe = await probeCollection(name)
  if (probe.exists) {
    report.existed = true
    report.ok = true
    return report
  }
  report.probeReason = probe.reason || ''

  const createdByApi = await tryCreateCollection(name)
  report.createCollectionSupported = createdByApi.supported
  if (createdByApi.supported) {
    report.createCollectionResult = createdByApi.ok ? 'created' : 'failed'
    if (!createdByApi.ok) report.createCollectionError = createdByApi.reason
  }

  if (createdByApi.ok) {
    report.created = true
    report.ok = true
    report.strategy = 'createCollection'
    return report
  }

  try {
    const dummyRes = await ensureCollectionByDummyWrite(name)
    report.created = true
    report.ok = true
    report.strategy = 'dummyWriteDelete'
    report.dummy = dummyRes
    return report
  } catch (err) {
    report.ok = false
    report.error = toErrorMessage(err)
    report.strategy = 'failed'
    return report
  }
}

async function createIndexWithFallback(coll, spec) {
  const attempts = [
    { name: spec.name, keys: spec.keys },
    { index: { name: spec.name, keys: spec.keys }, options: { unique: false } }
  ]

  let lastErr = null
  for (const payload of attempts) {
    try {
      await coll.createIndex(payload)
      return
    } catch (err) {
      lastErr = err
    }
  }

  throw lastErr
}

async function ensureIndex(collectionName, spec) {
  const report = {
    collection: collectionName,
    name: spec.name,
    keys: spec.keys,
    ok: false,
    existed: false,
    created: false,
    skipped: false
  }

  const coll = db.collection(collectionName)
  if (!coll || typeof coll.createIndex !== 'function') {
    report.skipped = true
    report.reason = 'collection.createIndex unavailable'
    return report
  }

  try {
    await createIndexWithFallback(coll, spec)
    report.ok = true
    report.created = true
    return report
  } catch (err) {
    if (isIndexAlreadyExistsError(err)) {
      report.ok = true
      report.existed = true
      return report
    }

    report.ok = false
    report.error = toErrorMessage(err)
    return report
  }
}

exports.main = async () => {
  const startedAt = now()

  const collections = []
  for (const name of REQUIRED_COLLECTIONS) {
    collections.push(await ensureCollection(name))
  }

  const indexes = []
  for (const name of REQUIRED_COLLECTIONS) {
    if (!REQUIRED_INDEXES[name]) continue

    const collectionReport = collections.find(x => x.name === name)
    if (!collectionReport || !collectionReport.ok) {
      for (const spec of REQUIRED_INDEXES[name]) {
        indexes.push({
          collection: name,
          name: spec.name,
          keys: spec.keys,
          ok: false,
          skipped: true,
          reason: 'collection unavailable'
        })
      }
      continue
    }

    for (const spec of REQUIRED_INDEXES[name]) {
      indexes.push(await ensureIndex(name, spec))
    }
  }

  const collectionOk = collections.every(x => x.ok)
  const indexOk = indexes.every(x => x.ok || x.skipped)

  return {
    ok: collectionOk && indexOk,
    version: INIT_VERSION,
    startedAt,
    finishedAt: now(),
    report: {
      collections,
      indexes,
      summary: {
        totalCollections: collections.length,
        okCollections: collections.filter(x => x.ok).length,
        totalIndexes: indexes.length,
        okIndexes: indexes.filter(x => x.ok).length,
        skippedIndexes: indexes.filter(x => x.skipped).length
      }
    }
  }
}
