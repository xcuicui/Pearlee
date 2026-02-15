const api = require('../../utils/api')

Page({
  data: {
    text: '',
    error: ''
  },

  onText(e) {
    this.setData({ text: e && e.detail ? String(e.detail.value || '') : '' })
  },

  async publish() {
    const text = String(this.data.text || '').trim()
    if (!text) {
      this.setData({ error: '写点什么吧。' })
      return
    }

    try {
      wx.showLoading({ title: '发布中' })
      await api.call('entry_create', { text })
      wx.hideLoading()
      wx.showToast({ title: '已点亮今天', icon: 'none' })
      wx.navigateBack({ delta: 1 })
    } catch (e) {
      wx.hideLoading()
      this.setData({ error: e.message || '发布失败' })
    }
  },

  cancel() {
    wx.navigateBack({ delta: 1 })
  }
})
