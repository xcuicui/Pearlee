const api = require('../../utils/api')

function pad2(n) { return String(n).padStart(2, '0') }
function timeText(ts) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
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
      const items = (res.items || []).map(x => ({
        id: x.id,
        text: x.text,
        createdAt: x.createdAt,
        timeText: timeText(x.createdAt),
        likeCount: x.likeCount || 0,
        liked: !!x.liked,
        comment: x.comment || null
      }))
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
  }
})
