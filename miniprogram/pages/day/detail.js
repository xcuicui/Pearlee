const api = require('../../utils/api')

function pad2(n) { return String(n).padStart(2, '0') }
function timeText(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const norm = v => String(v || '').trim()

// images field may be an array of cloud fileIDs (string), or an array of objects
// like {fileID: 'cloud://...'} depending on environment/version.
function extractFileID(v) {
  if (!v) return ''
  if (typeof v === 'string') return v
  // tolerate different casings/keys
  return v.fileID || v.fileId || v.fileid || v.id || ''
}

Page({
  data: {
    date: '',
    focus: '',
    items: [],
    draft: {},
    error: ''
  },

  onLoad(query) {
    const date = query && query.date ? String(query.date) : ''
    const focus = query && query.focus ? String(query.focus) : ''
    this.setData({ date, focus })
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const res = await api.call('day_entries', { date: this.data.date })

      // images may already be temp HTTPS URLs (returned by cloud function),
      // or cloud fileIDs (cloud://...). Only fileIDs need conversion.
      const allFileIds = []
      for (const it of (res.items || [])) {
        const imgs = Array.isArray(it.images) ? it.images : []
        for (const v of imgs) {
          const fid = norm(extractFileID(v))
          if (fid && fid.startsWith('cloud://')) allFileIds.push(fid)
        }
      }

      const idToUrl = new Map()
      if (allFileIds.length) {
        const t = await wx.cloud.getTempFileURL({ fileList: allFileIds })
        const list = (t && t.fileList) || []
        console.log('[day.detail] getTempFileURL count=', list.length)
        console.log('[day.detail] getTempFileURL sample=', list.slice(0, 2))
        for (const x of list) {
          const k = norm(x && (x.fileID || x.fileId))
          if (k && x && x.tempFileURL) idToUrl.set(k, x.tempFileURL)
        }
      } else {
        console.log('[day.detail] no image fileIDs in response')
      }

      console.log('[day.detail] entries count=', (res.items || []).length)
      console.log('[day.detail] first raw images=', res && res.items && res.items[0] ? res.items[0].images : null)

      const items = (res.items || []).map(x => {
        const raw = Array.isArray(x.images) ? x.images : []
        const mapped = raw
          .map(v => norm(extractFileID(v)))
          .map(v => {
            if (!v) return ''
            if (v.startsWith('http://') || v.startsWith('https://')) return v
            if (v.startsWith('cloud://')) return idToUrl.get(v) || ''
            return ''
          })
          .filter(Boolean)
          .slice(0, 9)

        const entryId = x.id || x._id
        if (raw.length && !mapped.length) {
          console.warn('[day.detail] image mapping empty for entry', entryId, {
            raw0: raw[0],
            raw0Type: typeof raw[0],
            raw0Keys: raw[0] && typeof raw[0] === 'object' ? Object.keys(raw[0]) : null,
            rawSample: raw.slice(0, 2)
          })
        }

        return {
          id: entryId,
          text: x.text,
          images: mapped,
          createdAt: x.createdAt,
          timeText: timeText(x.createdAt),
          likeCount: x.likeCount || 0,
          liked: !!x.liked,
          comment: x.comment || null
        }
      })

      this.setData({ items, error: '' })
    } catch (e) {
      this.setData({ error: e.message || '加载失败' })
    }
  },

  toggleLike(e) {
    const id = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.id : ''
    if (!id) return

    api.call('like_toggle', { entryId: id })
      .then(() => this.load())
      .catch(err => wx.showToast({ title: err.message || '失败', icon: 'none' }))
  },

  onDraft(e) {
    const id = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.id : ''
    const v = e && e.detail ? String(e.detail.value || '') : ''
    if (!id) return
    this.setData({ draft: { ...this.data.draft, [id]: v } })
  },

  sendComment(e) {
    const id = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.id : ''
    if (!id) return

    const content = String(this.data.draft[id] || '').trim()
    if (!content) {
      wx.showToast({ title: '写点回应吧', icon: 'none' })
      return
    }

    api.call('comment_set', { entryId: id, content })
      .then(() => {
        this.setData({ draft: { ...this.data.draft, [id]: '' } })
        return this.load()
      })
      .catch(err => wx.showToast({ title: err.message || '失败', icon: 'none' }))
  },

  previewEntryImage(e) {
    const entryId = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.id || '') : ''
    const idx = Number(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.idx : -1)
    if (!entryId || Number.isNaN(idx) || idx < 0) return
    const hit = (this.data.items || []).find(x => x.id === entryId)
    if (!hit || !Array.isArray(hit.images) || idx >= hit.images.length) return
    wx.previewImage({ current: hit.images[idx], urls: hit.images })
  }
})
