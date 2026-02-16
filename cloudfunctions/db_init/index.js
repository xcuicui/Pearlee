const cloud = require('wx-server-sdk')
const { now } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const INIT_VERSION = '2026-02-15'

const REQUIRED_COLLECTIONS = ['users', 'relationships', 'relationship_members', 'entries', 'likes', 'comments', 'relationship_stats']

const REQUIRED_INDEXES = {
  relationships: [
    { name: 'idx_inviteCode', keys: { inviteCode: 1 } },
    { name: 'idx_memberOpenids_archived', keys: { memberOpenids: 1, archived: 1 } }
  ],
  relationship_members: [
    { name: 'idx_relationshipId_userOpenid', keys: { relationshipId: 1, userOpenid: 1 }, unique: true }
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

function isDuplicateKeyError(err) {
  const msg = toErrorMessage(err).toLowerCase()
  return msg.includes('duplicate') || msg.includes('dup key') || msg.includes('唯一') || msg.includes('重复')
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
  const unique = !!spec.unique
  const attempts = [
    { name: spec.name, keys: spec.keys, unique },
    { index: { name: spec.name, keys: spec.keys }, options: { unique } }
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

async function ensureRelationshipMemberDoc(relationshipId, userOpenid, ts) {
  const q = await db.collection('relationship_members')
    .where({ relationshipId, userOpenid })
    .limit(1)
    .get()

  if ((q.data || []).length > 0) return { created: false, existed: true }

  try {
    await db.collection('relationship_members').add({
      data: {
        relationshipId,
        userOpenid,
        nicknameInRelationship: null,
        createdAt: ts,
        updatedAt: ts
      }
    })
    return { created: true, existed: false }
  } catch (err) {
    if (isDuplicateKeyError(err)) return { created: false, existed: true }
    throw err
  }
}

async function backfillRelationshipMembers() {
  const pageSize = 100
  let skip = 0
  let scannedRelationships = 0
  let createdMembers = 0
  let existedMembers = 0
  const startedAt = now()

  while (true) {
    const relQ = await db.collection('relationships')
      .orderBy('createdAt', 'asc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const rels = relQ.data || []
    if (!rels.length) break

    for (const rel of rels) {
      scannedRelationships += 1
      const relId = rel && rel._id ? String(rel._id) : ''
      if (!relId) continue
      const members = Array.isArray(rel.memberOpenids) ? rel.memberOpenids : []
      const uniqueMembers = Array.from(new Set(members.filter(Boolean)))
      for (const openid of uniqueMembers) {
        const r = await ensureRelationshipMemberDoc(relId, openid, now())
        if (r.created) createdMembers += 1
        else existedMembers += 1
      }
    }

    skip += rels.length
    if (rels.length < pageSize) break
  }

  return {
    ok: true,
    startedAt,
    finishedAt: now(),
    scannedRelationships,
    createdMembers,
    existedMembers
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
  let backfill = {
    ok: false,
    skipped: true,
    reason: 'relationship_members collection unavailable'
  }

  const memberCollection = collections.find(x => x.name === 'relationship_members')
  if (memberCollection && memberCollection.ok) {
    backfill = await backfillRelationshipMembers()
  }

  return {
    ok: collectionOk && indexOk && backfill.ok,
    version: INIT_VERSION,
    startedAt,
    finishedAt: now(),
    report: {
      collections,
      indexes,
      backfill,
      summary: {
        totalCollections: collections.length,
        okCollections: collections.filter(x => x.ok).length,
        totalIndexes: indexes.length,
        okIndexes: indexes.filter(x => x.ok).length,
        skippedIndexes: indexes.filter(x => x.skipped).length,
        backfillCreatedMembers: Number(backfill.createdMembers || 0)
      }
    }
  }
}
