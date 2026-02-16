const api = require('../../utils/api')

Page({
  data: {
    name: '我们',
    nickname: '',
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
      this.setData({ error: '请填写你在这段关系里的名字' })
      return
    }
    if (Array.from(nickname).length > 10) {
      this.setData({ error: '昵称最多 10 个字' })
      return
    }
    if (nickname === '你' || nickname === '对方' || nickname.toUpperCase() === 'TA') {
      this.setData({ error: '昵称不能使用占位词' })
      return
    }
    if (/[\p{Extended_Pictographic}\u200d\ufe0f]/u.test(nickname)) {
      this.setData({ error: '昵称不能包含表情符号' })
      return
    }

    try {
      this.setData({ error: '' })
      wx.showLoading({ title: '创建中' })
      await api.call('relationship_create', { name: this.data.name, startDate: this.data.startDate, nickname })
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
