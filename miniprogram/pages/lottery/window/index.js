const rewards = require('../../../utils/rewards')
const api = require('../../../utils/api')
const { t } = require('../../../utils/strings')

function rarityText(rarity) {
  const r = String(rarity || 'occasional')
  if (r === 'common') return t('REWARDS_RARITY_COMMON')
  if (r === 'rare') return t('REWARDS_RARITY_RARE')
  return t('REWARDS_RARITY_OCCASIONAL')
}

Page({
  data: {
    titleText: '',
    subtitleText: '',
    segToMeText: '',
    segSentByMeText: '',
    addGiftText: '',
    deleteActionText: '',
    deletingText: '',
    emptyText: '',

    currentView: 'toMe',
    partnerNickname: '对方',
    gifts: [],
    loading: false,
    deletingId: ''
  },

  onLoad() {
    this.setData({
      titleText: t('REWARDS_WINDOW_TITLE'),
      subtitleText: t('REWARDS_WINDOW_SUBTITLE'),
      segToMeText: t('REWARDS_WINDOW_SEG_TO_ME'),
      segSentByMeText: t('REWARDS_WINDOW_SEG_SENT_BY_ME'),
      addGiftText: t('REWARDS_WINDOW_ADD_GIFT'),
      deleteActionText: t('REWARDS_WINDOW_DELETE_ACTION'),
      deletingText: t('REWARDS_WINDOW_DELETE_PROCESSING')
    })
    this.bootstrap()
  },

  onShow() {
    this.loadGifts()
  },

  bootstrap() {
    return api.call('ctx_get')
      .then((res) => {
        const rel = res && res.relationship ? res.relationship : null
        const partner = rel && rel.partner ? rel.partner : null
        this.setData({ partnerNickname: String((partner && partner.nickname) || '对方') })
      })
      .catch(() => {
        this.setData({ partnerNickname: '对方' })
      })
      .finally(() => this.loadGifts())
  },

  resolveEmptyText(view) {
    if (view === 'sentByMe') return t('REWARDS_WINDOW_EMPTY_SENT')
    return t('REWARDS_WINDOW_EMPTY_TO_ME')
  },

  normalizeList(list, view, partnerNickname) {
    return (Array.isArray(list) ? list : []).map((item) => {
      const recipientId = String((item && item.recipient_user_id) || '')
      const creatorId = String((item && item.created_by_user_id) || '')
      const sourceText = view === 'toMe'
        ? t('REWARDS_WINDOW_FROM_PARTNER', { partnerNickname })
        : t('REWARDS_WINDOW_TO_PARTNER', { partnerNickname })
      return {
        id: String((item && item.id) || ''),
        title: String((item && item.title) || ''),
        description: String((item && item.description) || ''),
        rarity: String((item && item.rarity) || 'occasional'),
        rarityText: rarityText(item && item.rarity),
        sourceText,
        canDelete: !!(item && item.can_delete),
        recipientId,
        creatorId
      }
    }).filter(x => !!x.id)
  },

  loadGifts() {
    if (this.data.loading) return
    const view = this.data.currentView
    this.setData({ loading: true })
    rewards.listGiftDefinitions(view)
      .then((res) => {
        this.setData({
          gifts: this.normalizeList(res && res.gifts, view, this.data.partnerNickname),
          emptyText: this.resolveEmptyText(view)
        })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '加载失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  onSwitchView(e) {
    const view = String((e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.view) || '').trim()
    if (!view || (view !== 'toMe' && view !== 'sentByMe')) return
    if (view === this.data.currentView) return
    this.setData({ currentView: view, gifts: [], emptyText: this.resolveEmptyText(view) })
    this.loadGifts()
  },

  onGoAdd() {
    wx.navigateTo({ url: '/pages/lottery/gift-add/index' })
  },

  onDeleteGift(e) {
    const id = String((e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) || '').trim()
    if (!id || this.data.deletingId) return

    wx.showModal({
      title: t('REWARDS_WINDOW_DELETE_MODAL_TITLE'),
      content: t('REWARDS_WINDOW_DELETE_MODAL_CONTENT'),
      confirmText: t('REWARDS_WINDOW_DELETE_MODAL_CONFIRM'),
      cancelText: t('REWARDS_WINDOW_DELETE_MODAL_CANCEL'),
      success: (res) => {
        if (!res || !res.confirm) return
        this.setData({ deletingId: id })
        rewards.deleteGiftDefinition(id)
          .then(() => {
            this.loadGifts()
          })
          .catch((err) => {
            wx.showToast({ title: (err && err.message) || '移出失败', icon: 'none' })
          })
          .finally(() => {
            this.setData({ deletingId: '' })
          })
      }
    })
  }
})
