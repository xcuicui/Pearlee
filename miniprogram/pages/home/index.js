const api = require('../../utils/api')

function pad2(n) { return String(n).padStart(2, '0') }
function dayKeyFromDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function calcDays(startDate) {
  // startDate: YYYY-MM-DD
  const [y, m, d] = String(startDate || '').split('-').map(Number)
  if (!y || !m || !d) return 1
  const start = new Date(y, m - 1, d)
  const now = new Date()
  const diff = now.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)
  return Math.floor(diff / 86400000) + 1
}

function monthLabel(year, month) {
  return `${year}年${month}月`
}

Page({
  data: {
    relationshipId: '',
    relName: '我们',
    startDate: '',

    days: 1,
    year: new Date().getFullYear(),

    loading: false,
    error: '',

    emotion: { empty: true },

    month: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
    monthLabel: '',
    marks: {},

    today: { key: dayKeyFromDate(new Date()), hasAny: false }
  },

  onShow() {
    this.refresh()
  },

  async refresh() {
    this.setData({ loading: true, error: '' })

    try {
      const { year, month } = this.data.month
      const res = await api.call('home_feed', { year, month })

      if (!res || !res.relationshipId) {
        wx.redirectTo({ url: '/pages/relationship/create' })
        return
      }

      this.setData({
        relationshipId: res.relationshipId,
        relName: res.relationshipName || '我们',
        startDate: res.startDate || '',
        days: res.startDate ? calcDays(res.startDate) : 1,
        year: new Date().getFullYear(),
        emotion: res.emotion || { empty: true },
        marks: res.marks || {},
        today: res.today || { key: this.data.today.key, hasAny: false },
        monthLabel: monthLabel(year, month),
        loading: false
      })

      // reflect relationship name in nav bar subtly
      wx.setNavigationBarTitle({ title: '贝忆' })
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败' })
    }
  },

  prevMonth() {
    let { year, month } = this.data.month
    month -= 1
    if (month <= 0) { month = 12; year -= 1 }
    this.setData({ month: { year, month } })
    this.refresh()
  },

  nextMonth() {
    let { year, month } = this.data.month
    month += 1
    if (month >= 13) { month = 1; year += 1 }
    this.setData({ month: { year, month } })
    this.refresh()
  },

  onPickDay(e) {
    const key = e && e.detail ? e.detail.key : ''
    if (!key) return
    wx.navigateTo({ url: `/pages/day/detail?date=${key}` })
  },

  openEmotion() {
    const id = this.data.emotion && this.data.emotion.entryId ? this.data.emotion.entryId : ''
    const date = this.data.emotion && this.data.emotion.date ? this.data.emotion.date : ''
    if (id && date) {
      wx.navigateTo({ url: `/pages/day/detail?date=${date}&focus=${id}` })
      return
    }
    this.goPublish()
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/entry/publish' })
  }
})
