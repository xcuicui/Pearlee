const api = require('../../utils/api')
const { t } = require('../../utils/strings')
const { fallbackTa } = require('../../utils/naming')

function pad2(n) { return String(n).padStart(2, '0') }
function ymdDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function parseYmd(s) {
  const m = String(s || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}
function weekStartOf(d0) {
  const d = new Date(d0.getTime())
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}
function weekStartOfToday() {
  return ymdDate(weekStartOf(new Date()))
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

function normalizeWeekDays(week) {
  const w = week || {}
  const days = Array.isArray(w.days) ? w.days : []
  const levelByDate = w && w.levelByDate && typeof w.levelByDate === 'object' ? w.levelByDate : {}
  const activeDates = Array.isArray(w.activeDates) ? w.activeDates : []
  const todayKey = String(w.todayKey || '')

  return days.map((date) => {
    const baseLevel = Number(levelByDate[date] || 0)
    const hasRecord = activeDates.includes(date)
    const recordLevel = hasRecord ? Math.max(baseLevel, 1) : baseLevel
    return {
      date,
      dayLabel: String(date || '').slice(-2),
      weekLabel: weekdayLabel(date),
      hasRecord,
      recordLevel,
      isToday: date === todayKey
    }
  })
}

function buildPlaceholderWeekDays(startYmd, todayKey) {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = addDaysYmd(startYmd, i)
    return {
      date,
      dayLabel: String(date || '').slice(-2),
      weekLabel: weekdayLabel(date),
      hasRecord: false,
      recordLevel: 0,
      isToday: date === todayKey
    }
  })
}

function mod3(n) {
  const x = n % 3
  return x < 0 ? x + 3 : x
}

Page({
  data: {
    relationshipId: '',
    relName: '我们',
    nickname: '对方',

    // naming system copies
    streakText: '',
    weekTodayText: '',
    emotionEmptyTimeText: '',
    emotionEmptyText: '',
    fabAriaLabel: '',
    fabBubbleText: '',
    emotionFromText: '',
    startDate: '',
    days: 1,
    streak: { current: 0, visible: false },

    loading: false,
    error: '',
    cardLoading: false,

    emotion: { empty: true },
    cards: [],
    activeCardIndex: 0,
    today: { key: ymdDate(new Date()), hasAny: false },

    // week strip
    weekStart: weekStartOfToday(),
    weekTitle: '',
    weekDays: [],

    // swiper state (IMPORTANT: we do NOT reset current after swipe)
    swiperCurrent: 1,
    weekPages: [[], [], []]
  },

  onLoad() {
    this.applyNamingCopies()
    this.fetchCardFeed()
  },

  onShow() {
    this.fetchCardFeed()
  },

  applyNamingCopies() {
    const ta = fallbackTa(this.data.nickname)
    const streakN = this.data.streak && this.data.streak.current ? Number(this.data.streak.current) : 0

    // emotion from
    const e = this.getActiveCard()
    let emotionFromText = ''
    if (!e) {
      emotionFromText = t('HOME_EMOTION_FROM_US')
    } else {
      const from = String(e.from || '').trim()
      const isSelf = from === '我' || from === '你'
      emotionFromText = isSelf
        ? t('HOME_EMOTION_FROM_ME_MURMUR', { TaNickname: ta })
        : t('HOME_EMOTION_FROM_PARTNER_MURMUR', { TaNickname: ta })
    }

    this.setData({
      streakText: streakN >= 2 ? t('HOME_STREAK', { N: streakN }) : '',
      weekTodayText: t('HOME_WEEK_TODAY'),
      emotionEmptyTimeText: t('HOME_EMOTION_EMPTY_TIME'),
      emotionEmptyText: t('HOME_EMOTION_EMPTY_TEXT'),
      fabAriaLabel: t('FAB_MURMUR_ENTRY_NAME'),
      fabBubbleText: t('FAB_MURMUR_ENTRY_NAME'),
      emotionFromText
    })
  },

  getActiveCard() {
    const cards = Array.isArray(this.data.cards) ? this.data.cards : []
    if (!cards.length) return null
    const idx = Math.max(0, Math.min(Number(this.data.activeCardIndex || 0), cards.length - 1))
    return cards[idx] || null
  },

  normalizeCards(cards) {
    const list = Array.isArray(cards) ? cards : []
    return list.map((item) => {
      const x = item && typeof item === 'object' ? item : {}
      const id = String(x.id || x.entryId || '')
      const entryId = String(x.entryId || id)
      return {
        id: id || entryId,
        entryId,
        date: String(x.date || ''),
        timeText: String(x.timeText || ''),
        text: String(x.text || ''),
        from: String(x.from || ''),
        coverImage: String(x.coverImage || '')
      }
    }).filter((x) => x.id)
  },

  async fetchCardFeed() {
    if (this.data.cardLoading) return
    this.setData({ cardLoading: true })
    try {
      const res = await api.call('home_emotion_cards', { limit: 3 })
      if (!res || !res.relationshipId) {
        wx.redirectTo({ url: '/pages/relationship/create' })
        return
      }

      const cards = this.normalizeCards(res.cards)
      const nextIndex = cards.length
        ? Math.max(0, Math.min(Number(this.data.activeCardIndex || 0), cards.length - 1))
        : 0
      const active = cards[nextIndex] || null
      this.setData({
        relationshipId: String(res.relationshipId || ''),
        cards,
        activeCardIndex: nextIndex,
        emotion: active ? { ...active, empty: false } : { empty: true }
      })
      this.applyNamingCopies()
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' })
    } finally {
      this.setData({ cardLoading: false })
    }
  },

  onPullDownRefresh() {
    this.fetchCardFeed().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  _ensureCache() {
    if (!this._weekCache) this._weekCache = Object.create(null)
  },

  _getCachedWeek(startYmd) {
    this._ensureCache()
    return this._weekCache[startYmd] || null
  },

  _setCachedWeek(startYmd, weekDays) {
    if (!startYmd || !Array.isArray(weekDays)) return
    this._ensureCache()
    this._weekCache[startYmd] = { weekDays }
  },

  _getWeekDaysFor(startYmd) {
    const cached = this._getCachedWeek(startYmd)
    if (cached && Array.isArray(cached.weekDays) && cached.weekDays.length) return cached.weekDays

    const todayKey = this.data.today && this.data.today.key ? this.data.today.key : ymdDate(new Date())
    return buildPlaceholderWeekDays(startYmd, todayKey)
  },

  _buildPagesForCurrent(currentIndex, centerStart) {
    const pages = [[], [], []]

    const prevIdx = mod3(currentIndex - 1)
    const nextIdx = mod3(currentIndex + 1)

    pages[currentIndex] = this._getWeekDaysFor(centerStart)
    pages[prevIdx] = this._getWeekDaysFor(addDaysYmd(centerStart, -7))
    pages[nextIdx] = this._getWeekDaysFor(addDaysYmd(centerStart, 7))

    return pages
  },

  async refreshAll() {
    this.setData({ loading: true, error: '' })

    try {
      const res = await api.call('home_feed', { weekStart: this.data.weekStart })
      if (!res || !res.relationshipId) {
        wx.redirectTo({ url: '/pages/relationship/create' })
        return
      }

      const week = res.week || {}
      const weekStart = week.start || this.data.weekStart
      const weekDays = normalizeWeekDays(week)

      this._setCachedWeek(weekStart, weekDays)

      const current = Number(this.data.swiperCurrent || 1)

      this.setData({
        relationshipId: res.relationshipId,
        relName: res.relationshipName || '我们',
        nickname: res.partnerNickname || res.nickname || '对方',
        startDate: res.startDate || '',
        days: Number(res.daysSinceStart || 1),
        streak: res.streak || { current: 0, visible: false },
        emotion: res.emotion || { empty: true },
        today: res.today || { key: this.data.today.key, hasAny: false },

        weekStart,
        weekTitle: weekTitle(weekStart),
        weekDays,

        weekPages: this._buildPagesForCurrent(current, weekStart),
        loading: false
      })

      this.applyNamingCopies()

      this._prefetchWeek(addDaysYmd(weekStart, -7))
      this._prefetchWeek(addDaysYmd(weekStart, 7))

      wx.setNavigationBarTitle({ title: '贝忆' })
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败' })
    }
  },

  async _prefetchWeek(startYmd) {
    if (!startYmd) return
    if (this._getCachedWeek(startYmd)) return

    try {
      const res = await api.call('home_feed', { weekStart: startYmd })
      const week = res && res.week ? res.week : null
      if (!week || !week.start) return

      const weekDays = normalizeWeekDays(week)
      this._setCachedWeek(week.start, weekDays)

      // best-effort: refresh pages while keeping swiperCurrent unchanged
      const current = Number(this.data.swiperCurrent || 1)
      this.setData({ weekPages: this._buildPagesForCurrent(current, this.data.weekStart) })
    } catch (e) {
      // ignore
    }
  },

  // ---------- interactions ----------
  tapPrevWeek() {
    // no animation: keep stable; user can swipe for animation
    this._switchWeekBy(-1)
  },

  tapNextWeek() {
    this._switchWeekBy(1)
  },

  goTodayWeek() {
    const start = weekStartOfToday()
    this._switchWeekTo(start)
  },

  _switchWeekBy(delta) {
    const targetStart = addDaysYmd(this.data.weekStart, delta * 7)
    this._switchWeekTo(targetStart)
  },

  _switchWeekTo(targetStart) {
    if (!targetStart) return

    const current = Number(this.data.swiperCurrent || 1)
    const weekDays = this._getWeekDaysFor(targetStart)

    this.setData({
      weekStart: targetStart,
      weekTitle: weekTitle(targetStart),
      weekDays,
      weekPages: this._buildPagesForCurrent(current, targetStart)
    })

    this._loadWeek(targetStart)
  },

  // swiper: only react after animation finished, and we DO NOT reset current
  onWeekSwipeFinish(e) {
    const detail = e && e.detail ? e.detail : {}
    const nextCurrent = Number(detail.current)
    const prevCurrent = Number(this.data.swiperCurrent || 1)

    if (nextCurrent === prevCurrent) return

    // Determine direction in a circular 3-page swiper.
    // From prev -> next:
    //  +1 (or -2) means swipe to the right item (next week)
    //  -1 (or +2) means swipe to the left item (prev week)
    const diff = nextCurrent - prevCurrent
    const isNext = (diff === 1 || diff === -2)
    const delta = isNext ? 1 : -1

    const targetStart = addDaysYmd(this.data.weekStart, delta * 7)
    if (!targetStart) return

    const weekDays = this._getWeekDaysFor(targetStart)

    // Update center week to match the *current visible page index* (no reset).
    this.setData({
      swiperCurrent: nextCurrent,
      weekStart: targetStart,
      weekTitle: weekTitle(targetStart),
      weekDays,
      weekPages: this._buildPagesForCurrent(nextCurrent, targetStart)
    })

    this._loadWeek(targetStart)
  },

  async _loadWeek(weekStart) {
    try {
      const res = await api.call('home_feed', { weekStart })
      const week = res && res.week ? res.week : null
      if (!week || !week.start) return

      const start = week.start
      const weekDays = normalizeWeekDays(week)
      this._setCachedWeek(start, weekDays)

      if (start !== this.data.weekStart) return

      const current = Number(this.data.swiperCurrent || 1)
      this.setData({
        weekTitle: weekTitle(start),
        weekDays,
        weekPages: this._buildPagesForCurrent(current, start)
      })

      this._prefetchWeek(addDaysYmd(start, -7))
      this._prefetchWeek(addDaysYmd(start, 7))
    } catch (e) {
      // ignore
    }
  },

  // ---------- routing ----------
  onPickDay(e) {
    const key = e && e.currentTarget && e.currentTarget.dataset ? String(e.currentTarget.dataset.key || '') : ''
    if (!key) return
    wx.navigateTo({ url: `/pages/day/detail?date=${key}` })
  },

  openEmotion() {
    const active = this.getActiveCard()
    const id = active && active.entryId ? active.entryId : ''
    const date = active && active.date ? active.date : ''
    if (id && date) {
      wx.navigateTo({ url: `/pages/day/detail?date=${date}&focus=${id}` })
      return
    }
    this.goPublish()
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/entry/publish' })
  },

  onCardSwiperChange(e) {
    const detail = e && e.detail ? e.detail : {}
    const idx = Number(detail.current || 0)
    const cards = Array.isArray(this.data.cards) ? this.data.cards : []
    if (!cards.length) return
    const next = Math.max(0, Math.min(idx, cards.length - 1))
    this.setData({
      activeCardIndex: next,
      emotion: { ...cards[next], empty: false }
    })
    this.applyNamingCopies()
  }
})
