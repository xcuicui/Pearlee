const api = require('../../utils/api')

Page({
  data: {
    relationshipId: '',
    name: '我们',
    startDate: '',
    inviteCode: '',
    error: ''
  },

  onShow() {
    this.load()
  },

  async load() {
    this.setData({ error: '' })
    try {
      const ctx = await api.call('ctx_get')
      if (!ctx || !ctx.relationship) {
        wx.redirectTo({ url: '/pages/relationship/create' })
        return
      }
      this.setData({
        relationshipId: ctx.relationship.id,
        name: ctx.relationship.name || '我们',
        startDate: ctx.relationship.startDate || '',
        inviteCode: ctx.relationship.inviteCode || ''
      })
    } catch (e) {
      this.setData({ error: e.message || '加载失败' })
    }
  },

  onName(e) {
    this.setData({ name: (e && e.detail ? String(e.detail.value || '') : '').trim() })
  },

  onPickDate(e) {
    const v = e && e.detail ? e.detail.value : ''
    this.setData({ startDate: v })
  },

  async save() {
    try {
      wx.showLoading({ title: '保存中' })
      await api.call('relationship_update', { name: this.data.name, startDate: this.data.startDate })
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'none' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '保存失败', icon: 'none' })
    }
  },

  copy() {
    const code = this.data.inviteCode
    if (!code) return
    wx.setClipboardData({ data: code })
  },

  goJoin() {
    wx.navigateTo({ url: '/pages/relationship/join' })
  },

  archive() {
    wx.showModal({
      title: '解除关系',
      content: '将封存关系，不删除历史记录，但不可继续发布。确定吗？',
      confirmText: '封存',
      confirmColor: '#c34848',
      success: async (res) => {
        if (!res || !res.confirm) return
        try {
          wx.showLoading({ title: '处理中' })
          await api.call('relationship_archive', {})
          wx.hideLoading()
          wx.showToast({ title: '已封存', icon: 'none' })
          wx.redirectTo({ url: '/pages/relationship/create' })
        } catch (e) {
          wx.hideLoading()
          wx.showToast({ title: e.message || '失败', icon: 'none' })
        }
      }
    })
  }
})
