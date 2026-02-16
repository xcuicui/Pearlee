const api = require('../../utils/api')

function pad2(n) { return String(n).padStart(2, '0') }
function ymdDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function parseYmd(s) {
  const m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}
function weekStartOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return ymdDate(d)
}
function addDaysYmd(s, delta) {
  const d = parseYmd(s)
  if (!d) return ''
  d.setDate(d.getDate() + delta)
  return ymdDate(d)
}
function weekdayLabel(dateYmd) {
  const d = parseYmd(dateYmd)
  if (!d) return ''
  const labels = ['一', '二', '三', '四', '五', '六', '日']
  return labels[(d.getDay() + 6) % 7]
}
function weekTitle(startYmd) {
  const s = parseYmd(startYmd)
  if (!s) return ''
  const e = new Date(s.getTime())
  e.setDate(e.getDate() + 6)
  return `${s.getMonth() + 1}.${s.getDate()} - ${e.getMonth() + 1}.${e.getDate()}`
}

Page({
  data: {
    relationshipId: '',
    relName: '我们',
    nickname: 'TA',
    startDate: '',
    days: 1,
    streak: { current: 0, visible: false },

    loading: false,
    error: '',

    emotion: { empty: true },
    today: { key: ymdDate(new Date()), hasAny: false },
    weekStart: weekStartOfToday(),
    weekTitle: '',
    weekDays: [],
    touchStartX: 0
  },

  onShow() {
    this.refresh()
  },

  async refresh() {
    this.setData({ loading: true, error: '' })

    try {
      const res = await api.call('home_feed', { weekStart: this.data.weekStart })

      if (!res || !res.relationshipId) {
        wx.redirectTo({ url: '/pages/relationship/create' })
        return
      }

      const week = res.week || {}
      const levelByDate = week && week.levelByDate && typeof week.levelByDate === 'object' ? week.levelByDate : {}
      const activeDates = Array.isArray(week.activeDates) ? week.activeDates : []
      const normalizedWeekDays = (Array.isArray(week.days) ? week.days : []).map((date) => {
        const baseLevel = Number(levelByDate[date] || 0)
        const hasRecord = activeDates.includes(date)
        const recordLevel = hasRecord ? Math.max(baseLevel, 1) : baseLevel
        return {
          date,
          dayLabel: String(date || '').slice(-2),
          weekLabel: weekdayLabel(date),
          hasRecord,
          recordLevel,
          isToday: date === week.todayKey
        }
      })

      this.setData({
        relationshipId: res.relationshipId,
        relName: res.relationshipName || '我们',
        nickname: res.nickname || 'TA',
        startDate: res.startDate || '',
        days: Number(res.daysSinceStart || 1),
        streak: res.streak || { current: 0, visible: false },
        emotion: res.emotion || { empty: true },
        weekStart: (week.start || this.data.weekStart),
        weekTitle: weekTitle(week.start || this.data.weekStart),
        weekDays: normalizedWeekDays,
        today: res.today || { key: this.data.today.key, hasAny: false },
        loading: false
      })

      wx.setNavigationBarTitle({ title: '贝忆' })
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败' })
    }
  },

  prevWeek() {
    const nextStart = addDaysYmd(this.data.weekStart, -7)
    if (!nextStart) return
    this.setData({ weekStart: nextStart })
    this.refresh()
  },

  nextWeek() {
    const nextStart = addDaysYmd(this.data.weekStart, 7)
    if (!nextStart) return
    this.setData({ weekStart: nextStart })
    this.refresh()
  },

  onPickDay(e) {
    const key = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.key || '') : ''
    if (!key) return
    wx.navigateTo({ url: `/pages/day/detail?date=${key}` })
  },

  onWeekTouchStart(e) {
    const x = e && e.changedTouches && e.changedTouches[0] ? Number(e.changedTouches[0].clientX) : 0
    this.setData({ touchStartX: x })
  },

  onWeekTouchEnd(e) {
    const x = e && e.changedTouches && e.changedTouches[0] ? Number(e.changedTouches[0].clientX) : 0
    const delta = x - Number(this.data.touchStartX || 0)
    if (Math.abs(delta) < 40) return
    if (delta > 0) {
      this.prevWeek()
      return
    }
    this.nextWeek()
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
