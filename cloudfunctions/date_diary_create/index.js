const cloud = require('wx-server-sdk')
const { BizError, now, dayKey } = require('./_shared')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function getRel(OPENID) {
  const q = await db.collection('relationships')
    .where({ memberOpenids: OPENID, archived: false })
    .limit(1)
    .get()
  return (q.data || [])[0] || null
}

function cleanText(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim()
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .map((x) => {
      if (!x) return null
      if (typeof x === 'string') {
        const url = String(x).trim()
        if (!url) return null
        return { url, width: 0, height: 0 }
      }
      if (typeof x === 'object') {
        const url = String(x.url || x.fileID || x.fileId || '').trim()
        if (!url) return null
        return {
          url,
          width: Number(x.width || 0) || 0,
          height: Number(x.height || 0) || 0
        }
      }
      return null
    })
    .filter(Boolean)
    .slice(0, 3)
}

async function assertPlanBelongsToRel(relationshipId, planId) {
  if (!planId) return null
  const q = await db.collection('date_plans').doc(planId).get().catch(() => null)
  const plan = q && q.data
  if (!plan || plan.relationshipId !== relationshipId) throw new BizError('清单项不存在', 'NOT_FOUND')
  return plan
}

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const rel = await getRel(OPENID)
  if (!rel) throw new BizError('还没有建立关系', 'NO_REL')

  const planIdRaw = cleanText(event.planId)
  const planId = planIdRaw || ''

  const text = cleanText(event.text)
  if (text && text.length > 500) throw new BizError('最多 500 字', 'TOO_LONG')

  const images = normalizeImages(event.images)
  if (Array.isArray(event.images) && event.images.length > 3) throw new BizError('最多 3 张图片', 'TOO_MANY_IMAGES')

  if (!text && images.length === 0) throw new BizError('写点什么吧', 'EMPTY')

  const occurAt = Number(event.occurAt || 0)
  if (!occurAt || !Number.isFinite(occurAt)) throw new BizError('occurAt 必填', 'MISSING_OCCUR_AT')

  const plan = await assertPlanBelongsToRel(rel._id, planId)

  const ts = now()
  const date = dayKey(occurAt)

  const res = await db.collection('date_diaries').add({
    data: {
      relationshipId: rel._id,
      planId: plan ? plan._id : '',
      planTitle: plan ? String(plan.title || '') : '',
      userOpenid: OPENID,
      text,
      images,
      occurAt,
      date,
      createdAt: ts,
      updatedAt: ts
    }
  })

  // Best-effort: update plan stats
  if (plan) {
    await db.collection('date_plans').doc(plan._id).update({
      data: {
        logCount: db.command.inc(1),
        lastOccurAt: occurAt,
        updatedAt: ts
      }
    }).catch(() => {})
  }

  return { ok: true, id: res._id }
}
