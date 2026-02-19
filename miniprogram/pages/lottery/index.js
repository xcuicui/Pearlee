const rewards = require('../../utils/rewards')
const { t } = require('../../utils/strings')

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateTime(ts) {
  const d = new Date(Number(ts || 0))
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function normalizeAssets(assets) {
  const a = assets && typeof assets === 'object' ? assets : {}
  return {
    points_balance: Number(a.points_balance || 0),
    ticket_balance: Number(a.ticket_balance || 0)
  }
}

function normalizePocketCoupons(list) {
  return (Array.isArray(list) ? list : [])
    .map((c) => ({
      id: String((c && c.id) || '').trim(),
      title: String((c && c.title) || ''),
      desc: String((c && c.desc) || ''),
      obtained_at: Number((c && c.obtained_at) || 0)
    }))
    .filter(x => !!x.id)
    .sort((a, b) => b.obtained_at - a.obtained_at)
    .slice(0, 3)
    .map(x => ({
      ...x,
      obtainedText: formatDateTime(x.obtained_at)
    }))
}

Page({
  data: {
    assets: { points_balance: 0, ticket_balance: 0 },
    refreshingAssets: false,
    loadingPocket: false,
    ceremonyState: 'idle',
    overlayVisible: false,
    resultCoupon: null,
    pocketGifts: [],

    titleText: '',
    subtitleText: '',
    assetsRuleText: '',
    drawButtonText: '',
    drawUnderCostText: '',
    drawInsufficientText: '',
    pocketTitleText: '',
    pocketViewAllText: '',
    pocketEmptyText: '',
    windowLinkText: '',
    resultTitleText: '',
    resultConfirmText: '',
    resultFooterText: ''
  },

  onLoad() {
    this.setData({
      titleText: t('REWARDS_LOTTERY_TITLE'),
      subtitleText: t('REWARDS_LOTTERY_SUBTITLE'),
      drawButtonText: t('REWARDS_DRAW_PRIMARY_CTA'),
      drawUnderCostText: t('REWARDS_DRAW_UNDER_COST'),
      drawInsufficientText: t('REWARDS_DRAW_UNDER_INSUFFICIENT'),
      pocketTitleText: t('REWARDS_DRAW_POCKET_TITLE'),
      pocketViewAllText: t('REWARDS_DRAW_POCKET_VIEW_ALL'),
      pocketEmptyText: t('REWARDS_DRAW_POCKET_EMPTY'),
      windowLinkText: t('REWARDS_DRAW_WINDOW_LINK'),
      resultTitleText: t('REWARDS_RESULT_TITLE'),
      resultConfirmText: t('REWARDS_RESULT_CONFIRM'),
      resultFooterText: t('REWARDS_RESULT_FOOTER'),
      assetsRuleText: t('REWARDS_DRAW_ASSETS_RULE_LINE', { points: 0 })
    })
    this.refreshAll()
  },

  onShow() {
    this.refreshAll()
  },

  onUnload() {
    if (this._overlayTimer) {
      clearTimeout(this._overlayTimer)
      this._overlayTimer = null
    }
  },

  refreshAll() {
    return Promise.all([this.refreshAssets(), this.loadPocketGifts()])
  },

  refreshAssets() {
    if (this.data.refreshingAssets) return Promise.resolve()
    this.setData({ refreshingAssets: true })
    return rewards.refreshAssets()
      .then((assets) => {
        const normalized = normalizeAssets(assets)
        this.setData({
          assets: normalized,
          assetsRuleText: t('REWARDS_DRAW_ASSETS_RULE_LINE', { points: normalized.points_balance })
        })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '加载失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ refreshingAssets: false })
      })
  },

  loadPocketGifts() {
    if (this.data.loadingPocket) return Promise.resolve()
    this.setData({ loadingPocket: true })
    return rewards.listCoupons()
      .then((res) => {
        this.setData({ pocketGifts: normalizePocketCoupons(res && res.coupons) })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '加载失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loadingPocket: false })
      })
  },

  onDraw() {
    const points = Number((this.data.assets && this.data.assets.points_balance) || 0)
    if (points < 1) {
      wx.showToast({ title: t('REWARDS_DRAW_UNDER_INSUFFICIENT'), icon: 'none' })
      return
    }
    if (this.data.ceremonyState === 'drawing' || this.data.overlayVisible) return

    this.setData({
      ceremonyState: 'drawing',
      overlayVisible: true,
      resultCoupon: null
    })
    rewards.drawLottery()
      .then((res) => {
        const coupon = res && res.coupon ? res.coupon : {}
        this.setData({
          resultCoupon: {
            title: String(coupon.title || t('REWARDS_COUPON')),
            desc: String(coupon.desc || '')
          },
          ceremonyState: 'result'
        })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '抽取失败', icon: 'none' })
        this.setData({
          ceremonyState: 'idle',
          overlayVisible: false,
          resultCoupon: null
        })
      })
  },

  onConfirmResult() {
    if (this.data.ceremonyState !== 'result') return
    if (this._overlayTimer) clearTimeout(this._overlayTimer)
    this.setData({ ceremonyState: 'confirmed' })
    this._overlayTimer = setTimeout(() => {
      this.setData({
        ceremonyState: 'idle',
        overlayVisible: false,
        resultCoupon: null
      })
      this.refreshAll()
      this._overlayTimer = null
    }, 180)
  },

  goWallet() {
    wx.navigateTo({ url: '/pages/coupons/wallet/index' })
  },

  goWindowDetail() {
    wx.navigateTo({ url: '/pages/lottery/window/index' })
  }
})
