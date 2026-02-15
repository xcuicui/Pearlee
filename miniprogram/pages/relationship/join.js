const api = require('../../utils/api')

Page({
  data: {
    code: '',
    error: ''
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
        this.setData({ error: '请输入邀请码' })
        return
      }
      wx.showLoading({ title: '加入中' })
      await api.call('relationship_join', { inviteCode: code })
      wx.hideLoading()
      wx.switchTab({ url: '/pages/home/index' })
    } catch (e) {
      wx.hideLoading()
      this.setData({ error: e.message || '加入失败' })
    }
  },

  back() {
    wx.navigateBack({ delta: 1 })
  }
})
