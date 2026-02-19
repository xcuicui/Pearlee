const rewards = require('../../../utils/rewards')
const { t } = require('../../../utils/strings')

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateTime(ts) {
  const d = new Date(Number(ts || 0))
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function normalizeCoupons(list) {
  return (Array.isArray(list) ? list : []).map((c) => {
    const id = String((c && c.id) || '').trim()
    const status = String((c && c.status) || 'unused')
    const obtainedAt = Number((c && c.obtained_at) || 0)
    return {
      id,
      title: String((c && c.title) || ''),
      desc: String((c && c.desc) || ''),
      status,
      obtained_at: obtainedAt,
      used_at: c && c.used_at ? Number(c.used_at) : null,
      statusText: status === 'used' ? t('REWARDS_USED') : t('REWARDS_UNUSED'),
      obtainedText: formatDateTime(obtainedAt),
      canUse: status !== 'used'
    }
  }).filter(x => !!x.id)
}

Page({
  data: {
    coupons: [],
    loading: false,
    usingCouponId: '',

    walletText: '',
    markUsedText: '',
    emptyText: ''
  },

  onLoad() {
    this.setData({
      walletText: t('REWARDS_WALLET'),
      markUsedText: t('REWARDS_MARK_USED'),
      emptyText: t('REWARDS_WALLET_EMPTY')
    })
  },

  onShow() {
    this.loadCoupons()
  },

  loadCoupons() {
    if (this.data.loading) return
    this.setData({ loading: true })
    rewards.listCoupons()
      .then((res) => {
        this.setData({ coupons: normalizeCoupons(res && res.coupons) })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '加载失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  onMarkUsed(e) {
    const id = String((e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) || '').trim()
    if (!id || this.data.usingCouponId) return

    wx.showModal({
      title: t('REWARDS_USE_CONFIRM_TITLE'),
      content: t('REWARDS_USE_CONFIRM_CONTENT'),
      confirmText: t('REWARDS_USE_CONFIRM_OK'),
      cancelText: t('REWARDS_USE_CONFIRM_CANCEL'),
      success: (res) => {
        if (!res || !res.confirm) return
        this.setData({ usingCouponId: id })
        rewards.useCoupon(id)
          .then(() => {
            this.loadCoupons()
          })
          .catch((err) => {
            wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' })
          })
          .finally(() => {
            this.setData({ usingCouponId: '' })
          })
      }
    })
  }
})
