const rewards = require('../../../utils/rewards')
const api = require('../../../utils/api')
const { t } = require('../../../utils/strings')

const RARITY_OPTIONS = [
  { value: 'common', labelKey: 'REWARDS_RARITY_COMMON', descKey: 'REWARDS_RARITY_COMMON_DESC' },
  { value: 'occasional', labelKey: 'REWARDS_RARITY_OCCASIONAL', descKey: 'REWARDS_RARITY_OCCASIONAL_DESC' },
  { value: 'rare', labelKey: 'REWARDS_RARITY_RARE', descKey: 'REWARDS_RARITY_RARE_DESC' }
]

Page({
  data: {
    titleText: '',
    nameLabelText: '',
    namePlaceholderText: '',
    descLabelText: '',
    descPlaceholderText: '',
    rarityLabelText: '',
    recipientLabelText: '',
    submitText: '',
    submittingText: '',
    errNameRequiredText: '',
    errRarityRequiredText: '',
    errRecipientRequiredText: '',

    meOpenid: '',
    meNickname: '我',
    partnerOpenid: '',
    partnerNickname: '对方',

    title: '',
    description: '',
    rarity: 'occasional',
    recipient_user_id: '',
    rarityOptions: [],
    recipientOptions: [],
    submitting: false
  },

  onLoad() {
    this.setData({
      titleText: t('REWARDS_WINDOW_ADD_TITLE'),
      nameLabelText: t('REWARDS_WINDOW_ADD_NAME_LABEL'),
      namePlaceholderText: t('REWARDS_WINDOW_ADD_NAME_PLACEHOLDER'),
      descLabelText: t('REWARDS_WINDOW_ADD_DESC_LABEL'),
      descPlaceholderText: t('REWARDS_WINDOW_ADD_DESC_PLACEHOLDER'),
      rarityLabelText: t('REWARDS_WINDOW_ADD_RARITY_LABEL'),
      recipientLabelText: t('REWARDS_WINDOW_ADD_RECIPIENT_LABEL'),
      submitText: t('REWARDS_WINDOW_ADD_SUBMIT'),
      submittingText: t('REWARDS_WINDOW_ADD_SUBMITTING'),
      errNameRequiredText: t('REWARDS_WINDOW_ADD_ERR_NAME_REQUIRED'),
      errRarityRequiredText: t('REWARDS_WINDOW_ADD_ERR_RARITY_REQUIRED'),
      errRecipientRequiredText: t('REWARDS_WINDOW_ADD_ERR_RECIPIENT_REQUIRED'),
      rarityOptions: RARITY_OPTIONS.map(item => ({
        value: item.value,
        label: t(item.labelKey),
        desc: t(item.descKey)
      }))
    })
    this.bootstrap()
  },

  bootstrap() {
    api.call('ctx_get')
      .then((res) => {
        const rel = res && res.relationship ? res.relationship : null
        const me = rel && rel.me ? rel.me : null
        const partner = rel && rel.partner ? rel.partner : null
        const meOpenid = String((me && me.openid) || '')
        const partnerOpenid = String((partner && partner.openid) || '')
        const meNickname = String((me && me.nickname) || '我')
        const partnerNickname = String((partner && partner.nickname) || '对方')

        const recipientOptions = [
          {
            value: partnerOpenid,
            label: t('REWARDS_WINDOW_ADD_RECIPIENT_PARTNER', { partnerNickname })
          },
          {
            value: meOpenid,
            label: t('REWARDS_WINDOW_ADD_RECIPIENT_ME')
          }
        ].filter(item => !!item.value)

        const defaultRecipient = partnerOpenid || meOpenid || ''

        this.setData({
          meOpenid,
          meNickname,
          partnerOpenid,
          partnerNickname,
          recipient_user_id: defaultRecipient,
          recipientOptions
        })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '加载失败', icon: 'none' })
      })
  },

  onTitleInput(e) {
    const value = String((e && e.detail && e.detail.value) || '').slice(0, 12)
    this.setData({ title: value })
  },

  onDescInput(e) {
    const value = String((e && e.detail && e.detail.value) || '').slice(0, 40)
    this.setData({ description: value })
  },

  onPickRarity(e) {
    const value = String((e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.value) || '')
    if (!value) return
    this.setData({ rarity: value })
  },

  onPickRecipient(e) {
    const value = String((e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.value) || '')
    if (!value) return
    this.setData({ recipient_user_id: value })
  },

  onSubmit() {
    if (this.data.submitting) return

    const title = String(this.data.title || '').trim()
    const description = String(this.data.description || '').trim()
    const rarity = String(this.data.rarity || '').trim()
    const recipientUserId = String(this.data.recipient_user_id || '').trim()

    if (!title) {
      wx.showToast({ title: this.data.errNameRequiredText, icon: 'none' })
      return
    }
    if (!rarity) {
      wx.showToast({ title: this.data.errRarityRequiredText, icon: 'none' })
      return
    }
    if (!recipientUserId) {
      wx.showToast({ title: this.data.errRecipientRequiredText, icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    rewards.upsertGiftDefinition({
      title,
      description,
      rarity,
      recipient_user_id: recipientUserId,
      is_active: true
    })
      .then(() => {
        wx.navigateBack({ delta: 1 })
      })
      .catch((e) => {
        wx.showToast({ title: (e && e.message) || '提交失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ submitting: false })
      })
  }
})
