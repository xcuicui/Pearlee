const api = require('../../utils/api')
const rewards = require('../../utils/rewards')
const { t } = require('../../utils/strings')
const { POINTS_HELP_PATH, getPointsHelpCopy } = require('../../utils/pointsHelpCopy')
const { fallbackTa } = require('../../utils/naming')
const { moodMeta, normalizeMoodLevel } = require('../../utils/mood')

const MOOD_OVERLAY_TOP_PADDING = 16
const MOOD_OVERLAY_BOTTOM_PADDING = 18
const MOOD_SUMMARY_LIMIT = 56

function calcDaysSinceStart(startDateYmd) {
  const d = parseYmd(startDateYmd)
  if (!d) return 1
  const s = d.setHours(0, 0, 0, 0)
  const now = new Date()
  const n = now.setHours(0, 0, 0, 0)
  return Math.floor((n - s) / 86400000) + 1
}

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

function moodPointTopPercent(level) {
  const usableHeight = 100 - MOOD_OVERLAY_TOP_PADDING - MOOD_OVERLAY_BOTTOM_PADDING
  const ratio = (level - 1) / (4 - 1)
  return 100 - MOOD_OVERLAY_BOTTOM_PADDING - ratio * usableHeight
}

function summarizeMoodText(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim()
  if (!raw) return ''
  if (raw.length <= MOOD_SUMMARY_LIMIT) return raw
  return `${raw.slice(0, MOOD_SUMMARY_LIMIT - 1)}…`
}

function formatMoodDate(dateYmd) {
  const d = parseYmd(dateYmd)
  if (!d) return dateYmd || ''
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function buildMoodByDate(mood7d) {
  const list = Array.isArray(mood7d) ? mood7d : []
  const out = Object.create(null)
  for (const item of list) {
    const date = String((item && item.date) || '').trim()
    if (!date) continue
    const moodLevel = normalizeMoodLevel(item && item.mood_level)
    if (!moodLevel) continue
    const meta = moodMeta(moodLevel)
    if (!meta) continue
    const lastEntry = item && item.lastEntry && typeof item.lastEntry === 'object' ? item.lastEntry : {}
    out[date] = {
      date,
      moodLevel,
      moodEmoji: meta.emoji,
      moodLabel: meta.label,
      moodSummary: summarizeMoodText(lastEntry.contentText),
      moodDateText: formatMoodDate(date)
    }
  }
  return out
}

function buildMoodOverlay(days) {
  const points = []
  const lines = []
  const dayList = Array.isArray(days) ? days : []

  for (let i = 0; i < dayList.length; i++) {
    const day = dayList[i]
    if (!day || !day.hasMood) continue
    const x = ((i + 0.5) / 7) * 100
    const y = Number(day.moodTopPercent || 0)
    points.push({
      key: day.date,
      style: `left:${x.toFixed(4)}%;top:${y.toFixed(4)}%;`
    })
  }

  for (let i = 0; i < dayList.length - 1; i++) {
    const a = dayList[i]
    const b = dayList[i + 1]
    if (!a || !b || !a.hasMood || !b.hasMood) continue
    const x1 = ((i + 0.5) / 7) * 100
    const x2 = ((i + 1.5) / 7) * 100
    const y1 = Number(a.moodTopPercent || 0)
    const y2 = Number(b.moodTopPercent || 0)
    const dx = x2 - x1
    const dy = y2 - y1
    const width = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    lines.push({
      key: `${a.date}_${b.date}`,
      style: `left:${x1.toFixed(4)}%;top:${y1.toFixed(4)}%;width:${width.toFixed(4)}%;transform:rotate(${angle.toFixed(4)}deg);`
    })
  }

  return { points, lines }
}

function normalizeWeekDays(week, moodByDate) {
  const w = week || {}
  const days = Array.isArray(w.days) ? w.days : []
  const levelByDate = w && w.levelByDate && typeof w.levelByDate === 'object' ? w.levelByDate : {}
  const activeDates = Array.isArray(w.activeDates) ? w.activeDates : []
  const todayKey = String(w.todayKey || '')
  const moodMap = moodByDate && typeof moodByDate === 'object' ? moodByDate : {}

  return days.map((date) => {
    const baseLevel = Number(levelByDate[date] || 0)
    const hasRecord = activeDates.includes(date)
    const recordLevel = hasRecord ? Math.max(baseLevel, 1) : baseLevel
    const mood = moodMap[date]
    const moodLevel = mood ? normalizeMoodLevel(mood.moodLevel) : 0
    const hasMood = !!moodLevel
    return {
      date,
      dayLabel: String(date || '').slice(-2),
      weekLabel: weekdayLabel(date),
      hasRecord,
      recordLevel,
      isToday: date === todayKey,
      hasMood,
      moodLevel,
      moodEmoji: mood ? mood.moodEmoji : '',
      moodLabel: mood ? mood.moodLabel : '',
      moodSummary: mood ? mood.moodSummary : '',
      moodDateText: mood ? mood.moodDateText : formatMoodDate(date),
      moodTopPercent: hasMood ? moodPointTopPercent(moodLevel) : 0
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
      isToday: date === todayKey,
      hasMood: false,
      moodLevel: 0,
      moodEmoji: '',
      moodLabel: '',
      moodSummary: '',
      moodDateText: formatMoodDate(date),
      moodTopPercent: 0
    }
  })
}

function makeWeekPage(days) {
  const list = Array.isArray(days) ? days : []
  const overlay = buildMoodOverlay(list)
  return {
    days: list,
    moodDots: overlay.points,
    moodLines: overlay.lines
  }
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

    // rewards
    checkinText: '',
    checkinTipText: '',
    pointsHelpLinkText: '',
    checkinDone: false,
    checkinLoading: false,
    assets: { points_balance: 0, ticket_balance: 0, last_checkin_date: '', coupon_counts: { unused: 0, used: 0 } },

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
    moodByDate: {},

    // swiper state (IMPORTANT: we do NOT reset current after swipe)
    swiperCurrent: 1,
    weekPages: [{ days: [], moodDots: [], moodLines: [] }, { days: [], moodDots: [], moodLines: [] }, { days: [], moodDots: [], moodLines: [] }]
  },

  onLoad() {
    const pointsHelpCopy = getPointsHelpCopy()
    // Ensure week strip renders immediately (placeholder) even before any network requests.
    const weekStart = this.data.weekStart || weekStartOfToday()
    const current = Number(this.data.swiperCurrent || 1)
    const weekDays = this._getWeekDaysFor(weekStart)
    this.setData({
      weekStart,
      weekTitle: weekTitle(weekStart),
      weekDays,
      weekPages: this._buildPagesForCurrent(current, weekStart)
    })
    this._loadWeek(weekStart)

    // Best-effort hydrate relationship header (nickname/days) without pulling full home_feed.
    api.call('ctx_get')
      .then((ctx) => {
        const rel = ctx && ctx.relationship
        if (!rel || !rel.partner) return
        const partnerNickname = String(rel.partner.nickname || '').trim()
        const startDate = String(rel.startDate || '').trim()
        this.setData({
          relName: rel.name || '我们',
          nickname: partnerNickname || this.data.nickname,
          startDate,
          days: startDate ? calcDaysSinceStart(startDate) : this.data.days
        })
        this.applyNamingCopies()
      })
      .catch(() => {
        // best-effort
      })

    this.applyNamingCopies()
    this.setData({
      checkinTipText: pointsHelpCopy.checkinTip,
      pointsHelpLinkText: pointsHelpCopy.linkText
    })
    this.loadRewardsBestEffort()
    this.fetchCardFeed()
  },

  onShow() {
    this.loadRewardsBestEffort()
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
      emotionFromText,
      checkinText: this.data.checkinDone ? t('REWARDS_CHECKIN_DONE') : t('REWARDS_CHECKIN_CTA')
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
    const normalizeImages = (raw) => {
      const arr = Array.isArray(raw) ? raw : []
      return arr
        .map((v) => String(v || '').trim())
        .filter((v) => !!v)
        .slice(0, 3)
    }
    return list.map((item) => {
      const x = item && typeof item === 'object' ? item : {}
      const id = String(x.id || x.entryId || '')
      const entryId = String(x.entryId || id)
      const moodLevel = normalizeMoodLevel(x.mood_level)
      const mood = moodMeta(moodLevel)
      const images0 = normalizeImages(x.images)
      const coverImage0 = String(x.coverImage || images0[0] || '')
      const images = images0.length ? images0 : (coverImage0 ? [coverImage0] : [])
      return {
        id: id || entryId,
        entryId,
        date: String(x.date || ''),
        timeText: String(x.timeText || ''),
        text: String(x.text || ''),
        from: String(x.from || ''),
        moodLevel,
        moodText: mood ? `${mood.emoji} ${mood.label}` : '',
        images,
        coverImage: coverImage0
      }
    }).filter((x) => x.id)
  },

  todayKeyLocal() {
    return ymdDate(new Date())
  },

  loadRewardsBestEffort() {
    rewards.refreshAssets()
      .then((assets) => {
        const last = assets && assets.last_checkin_date ? String(assets.last_checkin_date) : ''
        const done = last && last === this.todayKeyLocal()
        this.setData({
          assets,
          checkinDone: !!done
        })
        this.applyNamingCopies()
      })
      .catch(() => {
        // best-effort
      })
  },

  onCheckin() {
    if (this.data.checkinLoading) return
    if (this.data.checkinDone) {
      wx.showToast({ title: t('REWARDS_CHECKIN_DONE'), icon: 'none' })
      return
    }

    this.setData({ checkinLoading: true })
    rewards.checkin()
      .then((res) => {
        const earned = res && res.earned_points ? Number(res.earned_points || 0) : 0
        if (earned > 0) {
          wx.showToast({ title: t('REWARDS_CHECKIN_TOAST_OK'), icon: 'none' })
        } else {
          wx.showToast({ title: t('REWARDS_CHECKIN_DONE'), icon: 'none' })
        }
        this.setData({ checkinDone: true })
        this.applyNamingCopies()
        this.loadRewardsBestEffort()
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '打卡失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ checkinLoading: false })
      })
  },

  goPointsHelp() {
    wx.navigateTo({ url: POINTS_HELP_PATH })
  },

  async fetchCardFeed() {
    if (this.data.cardLoading) return
    this.setData({ cardLoading: true })
    try {
      const res = await api.call('home_emotion_cards', { limit: 10 })
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

  _getWeekDaysFor(startYmd, todayKeyOverride) {
    const cached = this._getCachedWeek(startYmd)
    const todayKey = todayKeyOverride || (this.data.today && this.data.today.key ? this.data.today.key : ymdDate(new Date()))
    if (cached && Array.isArray(cached.weekDays) && cached.weekDays.length) {
      return cached.weekDays.map((d) => ({
        ...d,
        isToday: d.date === todayKey
      }))
    }

    return buildPlaceholderWeekDays(startYmd, todayKey)
  },

  _buildPagesForCurrent(currentIndex, centerStart) {
    const pages = [null, null, null]

    const prevIdx = mod3(currentIndex - 1)
    const nextIdx = mod3(currentIndex + 1)

    pages[currentIndex] = makeWeekPage(this._getWeekDaysFor(centerStart))
    pages[prevIdx] = makeWeekPage(this._getWeekDaysFor(addDaysYmd(centerStart, -7)))
    pages[nextIdx] = makeWeekPage(this._getWeekDaysFor(addDaysYmd(centerStart, 7)))

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
      const moodByDate = buildMoodByDate(res.mood7d)
      const weekDays = normalizeWeekDays(week, moodByDate)

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
        moodByDate,

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

      const moodByDate = buildMoodByDate(res.mood7d)
      const weekDays = normalizeWeekDays(week, moodByDate)
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
    const todayKey = this.todayKeyLocal()
    this._switchWeekTo(start, { forceCenter: true, todayKey })
  },

  _switchWeekBy(delta) {
    const targetStart = addDaysYmd(this.data.weekStart, delta * 7)
    this._switchWeekTo(targetStart)
  },

  _switchWeekTo(targetStart, options = {}) {
    if (!targetStart) return

    const forceCenter = !!options.forceCenter
    const current = forceCenter ? 1 : Number(this.data.swiperCurrent || 1)
    const todayKey = options.todayKey || ''
    const weekDays = this._getWeekDaysFor(targetStart, todayKey)

    const nextData = {
      weekStart: targetStart,
      weekTitle: weekTitle(targetStart),
      weekDays,
      weekPages: this._buildPagesForCurrent(current, targetStart)
    }
    if (forceCenter) nextData.swiperCurrent = 1
    if (todayKey) {
      nextData.today = {
        ...(this.data.today || {}),
        key: todayKey
      }
    }

    this.setData(nextData)

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
      const moodByDate = buildMoodByDate(res.mood7d)
      const weekDays = normalizeWeekDays(week, moodByDate)
      this._setCachedWeek(start, weekDays)

      if (start !== this.data.weekStart) return

      const current = Number(this.data.swiperCurrent || 1)
      this.setData({
        moodByDate,
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
    wx.navigateTo({ url: `/pages/murmur/timeline/index?anchorDate=${key}&entry=calendar` })
  },

  openEmotion() {
    const active = this.getActiveCard()
    const id = active && active.entryId ? active.entryId : ''
    const date = active && active.date ? active.date : ''
    if (date) {
      const focusQuery = id ? `&focus=${id}` : ''
      wx.navigateTo({ url: `/pages/murmur/timeline/index?anchorDate=${date}&entry=card${focusQuery}` })
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
