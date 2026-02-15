const api = require('../../utils/api')

const MAX_IMAGES = 9

function extOf(path) {
  const s = String(path || '')
  const m = s.match(/(\.[a-zA-Z0-9]+)(?:\?|$)/)
  return m ? m[1].toLowerCase() : '.jpg'
}

function makeCloudPath(localPath, i) {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  return `entries/${ts}_${i}_${rand}${extOf(localPath)}`
}

Page({
  data: {
    text: '',
    images: [],
    error: ''
  },

  onText(e) {
    this.setData({ text: e && e.detail ? String(e.detail.value || '') : '' })
  },

  chooseImages() {
    const current = Array.isArray(this.data.images) ? this.data.images : []
    const remain = MAX_IMAGES - current.length
    if (remain <= 0) {
      wx.showToast({ title: '最多 9 张图片', icon: 'none' })
      return
    }

    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const picked = (res && res.tempFilePaths) || []
        const next = current.concat(picked).slice(0, MAX_IMAGES)
        this.setData({ images: next, error: '' })
      }
    })
  },

  removeImage(e) {
    const idx = Number(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.idx : -1)
    const list = Array.isArray(this.data.images) ? this.data.images : []
    if (Number.isNaN(idx) || idx < 0 || idx >= list.length) return
    const next = list.slice(0, idx).concat(list.slice(idx + 1))
    this.setData({ images: next })
  },

  previewImage(e) {
    const idx = Number(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.idx : -1)
    const list = Array.isArray(this.data.images) ? this.data.images : []
    if (Number.isNaN(idx) || idx < 0 || idx >= list.length) return
    wx.previewImage({ current: list[idx], urls: list })
  },

  async uploadSelectedImages() {
    const list = Array.isArray(this.data.images) ? this.data.images : []
    if (!list.length) return []
    const tasks = list.map((filePath, i) => wx.cloud.uploadFile({
      cloudPath: makeCloudPath(filePath, i),
      filePath
    }).then(res => res.fileID))
    return Promise.all(tasks)
  },

  async publish() {
    const text = String(this.data.text || '').trim()
    if (!text) {
      this.setData({ error: '写点什么吧。' })
      return
    }

    try {
      wx.showLoading({ title: '发布中' })
      const images = await this.uploadSelectedImages()
      await api.call('entry_create', { text, images })
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
