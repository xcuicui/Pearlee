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

function getImageInfo(filePath) {
  return new Promise((resolve) => {
    wx.getImageInfo({
      src: filePath,
      success: (res) => {
        resolve({
          path: filePath,
          width: Number(res.width || 0),
          height: Number(res.height || 0)
        })
      },
      fail: () => resolve({ path: filePath, width: 0, height: 0 })
    })
  })
}

function compressImageBestEffort(filePath, width) {
  return new Promise((resolve) => {
    const options = {
      src: filePath,
      quality: 75,
      success: (res) => resolve(String(res.tempFilePath || filePath)),
      fail: () => resolve(filePath)
    }

    if (Number(width) > 1080) {
      options.compressedWidth = 1080
    }

    wx.compressImage(options)
  })
}

function titleForToday() {
  const d = new Date()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${m}月${day}日`
}

Page({
  data: {
    text: '',
    images: [],
    error: '',
    showCount: false,
    canSubmit: false
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: titleForToday() })
    this.recompute()
  },

  recompute() {
    const text = String(this.data.text || '')
    const remaining = 500 - text.length
    const hasText = text.trim().length > 0
    const hasImages = Array.isArray(this.data.images) && this.data.images.length > 0

    this.setData({
      showCount: remaining <= 50,
      canSubmit: hasText || hasImages
    })
  },

  onText(e) {
    this.setData({ text: e && e.detail ? String(e.detail.value || '') : '' })
    this.recompute()
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
      success: async (res) => {
        const picked = (res && res.tempFilePaths) || []
        const normalized = await Promise.all(picked.map(p => getImageInfo(p)))
        const next = current.concat(normalized).slice(0, MAX_IMAGES)
        this.setData({ images: next, error: '' })
        this.recompute()
      }
    })
  },

  removeImage(e) {
    const idx = Number(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.idx : -1)
    const list = Array.isArray(this.data.images) ? this.data.images : []
    if (Number.isNaN(idx) || idx < 0 || idx >= list.length) return
    const next = list.slice(0, idx).concat(list.slice(idx + 1))
    this.setData({ images: next })
    this.recompute()
  },

  previewImage(e) {
    const idx = Number(e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.idx : -1)
    const list = Array.isArray(this.data.images) ? this.data.images : []
    if (Number.isNaN(idx) || idx < 0 || idx >= list.length) return
    wx.previewImage({ current: list[idx].path, urls: list.map(x => x.path) })
  },

  async uploadSelectedImages() {
    const list = Array.isArray(this.data.images) ? this.data.images : []
    if (!list.length) return []
    const tasks = list.map(async (img, i) => {
      const filePath = await compressImageBestEffort(img.path, img.width)
      const uploaded = await wx.cloud.uploadFile({
        cloudPath: makeCloudPath(filePath, i),
        filePath
      })
      return {
        url: uploaded.fileID,
        width: Number(img.width || 0),
        height: Number(img.height || 0)
      }
    })
    return Promise.all(tasks)
  },

  async onSubmit() {
    if (!this.data.canSubmit) return

    const text = String(this.data.text || '').trim()

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
  }
})
