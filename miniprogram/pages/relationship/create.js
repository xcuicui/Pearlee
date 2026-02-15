const api = require('../../utils/api')

Page({
  data: {
    name: '我们',
    startDate: '',
    error: ''
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

  onPickDate(e) {
    const v = e && e.detail ? e.detail.value : ''
    this.setData({ startDate: v })
  },

  async create() {
    try {
      wx.showLoading({ title: '创建中' })
      await api.call('relationship_create', { name: this.data.name, startDate: this.data.startDate })
      wx.hideLoading()
      wx.switchTab({ url: '/pages/home/index' })
    } catch (e) {
      wx.hideLoading()
      this.setData({ error: e.message || '创建失败' })
    }
  },

  goJoin() {
    wx.navigateTo({ url: '/pages/relationship/join' })
  }
})
