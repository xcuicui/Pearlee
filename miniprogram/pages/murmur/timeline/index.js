const api = require('../../../utils/api')
const { moodMeta, normalizeMoodLevel } = require('../../../utils/mood')

function pad2(n) { return String(n).padStart(2, '0') }
function ymdDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }

function parseYmd(s) {
  const m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  return d
}

function normalizeAnchorDate(v) {
  const d = parseYmd(v)
  if (!d) return ymdDate(new Date())
  return ymdDate(d)
}

function timeText(ts) {
  const d = new Date(Number(ts || 0))
  if (Number.isNaN(d.getTime())) return ''
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function toDateHeader(ymd) {
  const d = parseYmd(ymd)
  if (!d) return ymd
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function idForDate(ymd) {
  return `date-${String(ymd || '').replace(/-/g, '')}`
}

function mapItem(raw) {
  const level = normalizeMoodLevel(raw && raw.mood_level)
  const mood = moodMeta(level)
  const createdAt = Number(raw && raw.createdAt || 0)
  return {
    id: String(raw && raw.id || ''),
    text: String(raw && raw.text || ''),
    images: Array.isArray(raw && raw.images) ? raw.images.filter(Boolean).slice(0, 9) : [],
    createdAt,
    date: String(raw && raw.date || ''),
    mood_level: level || undefined,
    moodText: mood ? `${mood.emoji} ${mood.label}` : '',
    likeCount: Number(raw && raw.likeCount || 0),
    liked: !!(raw && raw.liked),
    commentCount: Number(raw && raw.commentCount || 0),
    timeText: timeText(createdAt)
  }
}

function mergeById(oldItems, incoming) {
  const map = new Map()
  for (const it of (oldItems || [])) {
    const id = String(it && it.id || '')
    if (!id) continue
    map.set(id, it)
  }
  for (const it of (incoming || [])) {
    const id = String(it && it.id || '')
    if (!id) continue
    map.set(id, it)
  }
  return Array.from(map.values())
}

function buildGroups(items, anchorDate) {
  const byDate = new Map()
  for (const it of (items || [])) {
    const k = String(it && it.date || '')
    if (!k) continue
    if (!byDate.has(k)) byDate.set(k, [])
    byDate.get(k).push(it)
  }

  const dates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a))
  const groups = dates.map((date) => {
    const list = (byDate.get(date) || []).slice().sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))
    return {
      date,
      headerId: idForDate(date),
      headerText: toDateHeader(date),
      isEmptyAnchor: false,
      items: list
    }
  })

  const hasAnchorGroup = groups.some(g => g.date === anchorDate)
  if (!hasAnchorGroup && parseYmd(anchorDate)) {
    groups.push({
      date: anchorDate,
      headerId: idForDate(anchorDate),
      headerText: toDateHeader(anchorDate),
      isEmptyAnchor: true,
      items: []
    })
    groups.sort((a, b) => b.date.localeCompare(a.date))
  }

  return groups
}

function calcCursors(items) {
  const list = (items || []).map(x => Number(x.createdAt || 0)).filter(n => Number.isFinite(n) && n > 0)
  if (!list.length) return { olderCursor: 0, newerCursor: 0 }
  return {
    olderCursor: Math.min(...list),
    newerCursor: Math.max(...list)
  }
}

Page({
  data: {
    anchorDate: '',
    entry: '',
    items: [],
    groups: [],
    olderCursor: 0,
    newerCursor: 0,
    hasOlder: true,
    hasNewer: true,
    loadingInitial: false,
    loadingOlder: false,
    loadingNewer: false,
    didAnchor: false,
    scrollIntoView: '',
    error: ''
  },

  onLoad(query) {
    const anchorDate = normalizeAnchorDate(query && query.anchorDate)
    this.setData({
      anchorDate,
      entry: String(query && query.entry || '')
    })
    this.loadInitial()
  },

  onUnload() {
    if (this._newerTimer) clearTimeout(this._newerTimer)
  },

  async loadInitial() {
    if (this.data.loadingInitial) return
    this.setData({ loadingInitial: true, error: '' })

    try {
      const res = await api.call('timeline_entries', {
        anchorDate: this.data.anchorDate,
        windowDays: 7,
        direction: 'initial'
      })
      const incoming = (res && res.items || []).map(mapItem).filter(x => x.id)
      const items = mergeById([], incoming)
      const groups = buildGroups(items, this.data.anchorDate)
      const cursors = calcCursors(items)

      this.setData({
        items,
        groups,
        olderCursor: Number(res && res.olderCursor || cursors.olderCursor || 0),
        newerCursor: Number(res && res.newerCursor || cursors.newerCursor || 0),
        hasOlder: true,
        hasNewer: true,
        loadingInitial: false
      })

      this.anchorOnce()
    } catch (e) {
      this.setData({
        loadingInitial: false,
        error: e.message || '加载失败'
      })
    }
  },

  anchorOnce() {
    if (this.data.didAnchor) return
    const target = idForDate(this.data.anchorDate)
    wx.nextTick(() => {
      this.setData({ scrollIntoView: target, didAnchor: true })
      setTimeout(() => this.setData({ scrollIntoView: '' }), 120)
    })
  },

  onReachBottom() {
    this.loadOlder()
  },

  onScroll(e) {
    const detail = e && e.detail ? e.detail : {}
    this._scrollTop = Number(detail.scrollTop || 0)
    if (this._scrollTop < 80) this.scheduleLoadNewer()
  },

  scheduleLoadNewer() {
    if (this.data.loadingInitial || this.data.loadingNewer || !this.data.hasNewer) return
    if (this._newerTimer) clearTimeout(this._newerTimer)
    this._newerTimer = setTimeout(() => this.loadNewer(), 180)
  },

  async loadOlder() {
    if (this.data.loadingInitial || this.data.loadingOlder || !this.data.hasOlder) return
    const cursor = Number(this.data.olderCursor || 0)
    if (!cursor) return

    this.setData({ loadingOlder: true })
    try {
      const res = await api.call('timeline_entries', {
        anchorDate: this.data.anchorDate,
        direction: 'older',
        cursor
      })
      const incoming = (res && res.items || []).map(mapItem).filter(x => x.id)
      const merged = mergeById(this.data.items, incoming)
      const groups = buildGroups(merged, this.data.anchorDate)
      const cursors = calcCursors(merged)

      this.setData({
        items: merged,
        groups,
        olderCursor: cursors.olderCursor || cursor,
        newerCursor: cursors.newerCursor || this.data.newerCursor,
        loadingOlder: false,
        hasOlder: incoming.length > 0
      })
    } catch (e) {
      this.setData({ loadingOlder: false, error: e.message || '加载失败' })
    }
  },

  async loadNewer() {
    if (this.data.loadingInitial || this.data.loadingNewer || !this.data.hasNewer) return
    const cursor = Number(this.data.newerCursor || 0)
    if (!cursor) return

    const keepHeaderId = this.data.groups && this.data.groups[0] ? this.data.groups[0].headerId : ''
    this.setData({ loadingNewer: true })
    try {
      const res = await api.call('timeline_entries', {
        anchorDate: this.data.anchorDate,
        direction: 'newer',
        cursor
      })

      const incoming = (res && res.items || []).map(mapItem).filter(x => x.id)
      const merged = mergeById(this.data.items, incoming)
      const groups = buildGroups(merged, this.data.anchorDate)
      const cursors = calcCursors(merged)

      this.setData({
        items: merged,
        groups,
        olderCursor: cursors.olderCursor || this.data.olderCursor,
        newerCursor: cursors.newerCursor || cursor,
        loadingNewer: false,
        hasNewer: incoming.length > 0
      })

      // Best effort: keep previous top group visible when prepending newer data.
      if (incoming.length && keepHeaderId && groups.length > 1) {
        wx.nextTick(() => {
          this.setData({ scrollIntoView: keepHeaderId })
          setTimeout(() => this.setData({ scrollIntoView: '' }), 120)
        })
      }
    } catch (e) {
      this.setData({ loadingNewer: false, error: e.message || '加载失败' })
    }
  },

  previewEntryImage(e) {
    const id = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.id || '') : ''
    const idx = Number(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.idx : -1)
    if (!id || Number.isNaN(idx) || idx < 0) return
    const hit = (this.data.items || []).find(x => x.id === id)
    if (!hit || !Array.isArray(hit.images) || idx >= hit.images.length) return
    wx.previewImage({ current: hit.images[idx], urls: hit.images })
  }
})
