const api = require('../../utils/api')
const { t } = require('../../utils/strings')

Page({
  data: {
    code: '',
    error: '',
    copy: {
      title: t('REL_JOIN_TITLE'),
      desc: t('REL_JOIN_DESC'),
      codePlaceholder: t('REL_JOIN_CODE_PLACEHOLDER'),
      submit: t('REL_JOIN_SUBMIT'),
      back: t('REL_JOIN_BACK')
    }
  },

  onLoad(query) {
    if (query && query.code) this.setData({ code: String(query.code) })
  },

  onCode(e) {
    this.setData({ code: (e && e.detail ? String(e.detail.value || '') : '').trim().toUpperCase() })
  },

  async join() {
    try {
      const code = this.data.code
      if (!code) {
        this.setData({ error: t('REL_JOIN_ERR_CODE_REQUIRED') })
        return
      }
      wx.showLoading({ title: t('REL_JOIN_LOADING') })
      await api.call('relationship_join', { inviteCode: code })
      wx.hideLoading()
      wx.switchTab({ url: '/pages/home/index' })
    } catch (e) {
      wx.hideLoading()
      this.setData({ error: e.message || t('REL_JOIN_ERR_FAIL') })
    }
  },

  back() {
    wx.navigateBack({ delta: 1 })
  }
})
