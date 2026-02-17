const api = require('../../utils/api')
const { t } = require('../../utils/strings')

function pad2(n) { return String(n).padStart(2, '0') }
function timeText(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function mapComment(c) {
  if (!c) return null
  const createdAt = Number(c.createdAt || 0)
  return {
    id: String(c.id || ''),
    entryId: String(c.entryId || ''),
    userOpenid: String(c.userOpenid || ''),
    authorNickname: String(c.authorNickname || ''),
    content: String(c.content || ''),
    createdAt,
    timeText: timeText(createdAt),
    isMine: !!c.isMine
  }
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

    // naming system copies
    commentTagText: '',
    commentPlaceholderText: '',
    commentSubmitText: '',
    loadMoreText: '',
    loadingText: '',
    emptyText: '',

    // per-entry draft input
    draft: {},

    // per-entry comments state
    commentsByEntry: {},
    cursorByEntry: {},
    loadingMoreByEntry: {},

    error: ''
  },

  onLoad(query) {
    const date = query && query.date ? String(query.date) : ''
    const focus = query && query.focus ? String(query.focus) : ''
    this.setData({
      date,
      focus,
      commentTagText: t('DAY_COMMENT_TAG'),
      commentPlaceholderText: t('DAY_COMMENT_PLACEHOLDER'),
      commentSubmitText: t('DAY_COMMENT_SUBMIT'),
      loadMoreText: t('DAY_LOAD_MORE'),
      loadingText: t('DAY_LOADING'),
      emptyText: t('DAY_EMPTY')
    })
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
          commentCount: Number(x.commentCount || 0)
        }
      })

      this.setData({ items, error: '' })

      // After entries loaded, load first page comments for each entry (MVP: limit 20)
      await this.loadCommentsForAllEntries()
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

  async loadCommentsForAllEntries() {
    const items = this.data.items || []
    for (const it of items) {
      const entryId = it && it.id ? String(it.id) : ''
      if (!entryId) continue
      // avoid duplicate load
      if (this.data.commentsByEntry && Array.isArray(this.data.commentsByEntry[entryId])) continue
      await this.loadComments(entryId, { reset: true })
    }
  },

  async loadComments(entryId, { reset } = {}) {
    const id = String(entryId || '').trim()
    if (!id) return

    const cursor = reset ? null : (this.data.cursorByEntry ? this.data.cursorByEntry[id] : null)

    if (!reset && !cursor) return

    if (!reset) {
      this.setData({ loadingMoreByEntry: { ...this.data.loadingMoreByEntry, [id]: true } })
    }

    try {
      const res = await api.call('comment_list', { entryId: id, limit: 20, cursor })
      const list = Array.isArray(res.comments) ? res.comments.map(mapComment).filter(Boolean) : []
      const next = res.nextCursor || null

      const prev = reset ? [] : (this.data.commentsByEntry && Array.isArray(this.data.commentsByEntry[id]) ? this.data.commentsByEntry[id] : [])
      const merged = prev.concat(list)

      this.setData({
        commentsByEntry: { ...this.data.commentsByEntry, [id]: merged },
        cursorByEntry: { ...this.data.cursorByEntry, [id]: next },
        loadingMoreByEntry: { ...this.data.loadingMoreByEntry, [id]: false }
      })
    } catch (err) {
      this.setData({ loadingMoreByEntry: { ...this.data.loadingMoreByEntry, [id]: false } })
      wx.showToast({ title: err.message || '失败', icon: 'none' })
    }
  },

  async sendComment(e) {
    const id = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.id : ''
    if (!id) return

    const content = String(this.data.draft[id] || '').trim()
    if (!content) {
      wx.showToast({ title: '写点什么再发送', icon: 'none' })
      return
    }

    try {
      const res = await api.call('comment_add', { entryId: id, content })
      const c = res && res.comment ? mapComment(res.comment) : null

      this.setData({ draft: { ...this.data.draft, [id]: '' } })

      if (c) {
        const prev = this.data.commentsByEntry && Array.isArray(this.data.commentsByEntry[id]) ? this.data.commentsByEntry[id] : []
        this.setData({ commentsByEntry: { ...this.data.commentsByEntry, [id]: prev.concat([c]) } })
      } else {
        await this.loadComments(id, { reset: true })
      }

      // bump commentCount in items
      const items = (this.data.items || []).map((it) => {
        if (String(it.id) !== String(id)) return it
        return { ...it, commentCount: Number(it.commentCount || 0) + 1 }
      })
      this.setData({ items })
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' })
    }
  },

  async onLoadMoreComments(e) {
    const entryId = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.entryId || '') : ''
    if (!entryId) return
    await this.loadComments(entryId, { reset: false })
  },

  async onLongPressComment(e) {
    const entryId = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.entryId || '') : ''
    const commentId = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.commentId || '') : ''
    const isMine = !!(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.isMine : false)

    if (!entryId || !commentId) return
    if (!isMine) return

    const r = await wx.showActionSheet({ itemList: ['删除'] }).catch(() => null)
    if (!r || r.tapIndex !== 0) return

    try {
      await api.call('comment_delete', { commentId })

      const prev = this.data.commentsByEntry && Array.isArray(this.data.commentsByEntry[entryId]) ? this.data.commentsByEntry[entryId] : []
      const next = prev.filter(x => String(x.id) !== String(commentId))
      this.setData({ commentsByEntry: { ...this.data.commentsByEntry, [entryId]: next } })

      const items = (this.data.items || []).map((it) => {
        if (String(it.id) !== String(entryId)) return it
        return { ...it, commentCount: Math.max(0, Number(it.commentCount || 0) - 1) }
      })
      this.setData({ items })

      wx.showToast({ title: '已删除', icon: 'none' })
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' })
    }
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
