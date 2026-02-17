const api = require('../../utils/api')
const { t } = require('../../utils/strings')

Page({
  data: {
    name: '我们',
    nickname: '',
    startDate: '',
    error: '',
    copy: {
      title: t('REL_CREATE_TITLE'),
      relName: t('REL_CREATE_REL_NAME'),
      relNamePlaceholder: t('REL_CREATE_REL_NAME_PLACEHOLDER'),
      nicknameAsk: t('REL_CREATE_NICKNAME_ASK'),
      nicknamePlaceholder: t('REL_CREATE_NICKNAME_PLACEHOLDER'),
      startDate: t('REL_CREATE_START_DATE'),
      datePickPlaceholder: t('REL_CREATE_DATE_PICK_PLACEHOLDER'),
      submit: t('REL_CREATE_SUBMIT'),
      haveCode: t('REL_CREATE_HAVE_CODE')
    }
  },

  onShow() {
    // if already has relationship, go home
    this.tryRedirect()
  },

  async tryRedirect() {
    try {
      const ctx = await api.call('ctx_get')
      if (ctx && ctx.relationship && ctx.relationship.id) {
        wx.switchTab({ url: '/pages/home/index' })
      }
    } catch (e) {
      // ignore
    }
  },

  onName(e) {
    this.setData({ name: (e && e.detail ? String(e.detail.value || '') : '').trim() })
  },

  onNickname(e) {
    this.setData({ nickname: (e && e.detail ? String(e.detail.value || '') : '') })
  },

  onPickDate(e) {
    const v = e && e.detail ? e.detail.value : ''
    this.setData({ startDate: v })
  },

  async create() {
    const nickname = String(this.data.nickname || '').trim()
    if (!nickname) {
      this.setData({ error: t('REL_ERR_NICKNAME_REQUIRED') })
      return
    }
    if (Array.from(nickname).length > 10) {
      this.setData({ error: t('REL_ERR_NICKNAME_TOO_LONG') })
      return
    }
    if (nickname === '你' || nickname === '对方' || nickname.toUpperCase() === 'TA') {
      this.setData({ error: t('REL_ERR_NICKNAME_PLACEHOLDER') })
      return
    }
    if (/[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(nickname)) {
      this.setData({ error: t('REL_ERR_NICKNAME_EMOJI') })
      return
    }

    try {
      this.setData({ error: '' })
      wx.showLoading({ title: t('REL_LOADING_CREATING') })
      await api.call('relationship_create', { name: this.data.name, startDate: this.data.startDate, nickname })
      wx.hideLoading()
      wx.switchTab({ url: '/pages/home/index' })
    } catch (e) {
      wx.hideLoading()
      this.setData({ error: e.message || t('REL_ERR_CREATE_FAIL') })
    }
  },

  goJoin() {
    wx.navigateTo({ url: '/pages/relationship/join' })
  }
})
