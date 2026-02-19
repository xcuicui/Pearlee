const api = require('../../utils/api')
const rewards = require('../../utils/rewards')
const { t } = require('../../utils/strings')
const { formatMonthDay } = require('../../utils/format')
const { fallbackMe } = require('../../utils/naming')

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
  return formatMonthDay(new Date())
}

Page({
  data: {
    text: '',
    images: [],
    error: '',
    showCount: false,
    canSubmit: false,

    // naming system copies
    titleText: '',
    subtitleText: '',
    hintText: '',
    placeholderText: '',
    addPhotoText: '',
    submitText: ''
  },

  onLoad() {
    const title = titleForToday()
    wx.setNavigationBarTitle({ title })

    // Render static copy immediately on first paint.
    this.setData({
      titleText: title,
      subtitleText: t('COMPOSER_SUBTITLE_BOX', { MyNickname: '我' }),
      hintText: t('COMPOSER_HINT_LINE'),
      placeholderText: t('COMPOSER_PLACEHOLDER'),
      addPhotoText: t('COMPOSER_ADD_PHOTO'),
      submitText: t('COMPOSER_SUBMIT')
    })

    this.recompute()

    // Best-effort nickname refine in background; never block initial render.
    api.call('ctx_get')
      .then((ctx) => {
        const relationship = ctx && ctx.relationship
        const meNickname = relationship && relationship.me && String(relationship.me.nickname || '').trim()
        if (!meNickname) return
        this.setData({
          subtitleText: t('COMPOSER_SUBTITLE_BOX', { MyNickname: fallbackMe(meNickname) })
        })
      })
      .catch(() => {
        // best-effort
      })
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
    const content_len = text.length
    const image_count = Array.isArray(this.data.images) ? this.data.images.length : 0

    function withTimeout(promise, ms) {
      if (!ms) return promise
      let timer
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error('timeout')
          err.code = 'TIMEOUT'
          reject(err)
        }, ms)
      })
      return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
    }

    try {
      wx.showLoading({ title: '发布中' })
      const images = await this.uploadSelectedImages()
      const created = await api.call('entry_create', { text, images })

      // Best-effort: earn shells after publish; never block success flow.
      const entryId = created && created.id ? String(created.id) : ''
      let earned = 0
      if (entryId) {
        try {
          const earnRes = await withTimeout(
            rewards.earnMurmurPoints({ entryId, content_len, image_count }),
            1200
          )
          earned = earnRes && earnRes.earned_points ? Number(earnRes.earned_points || 0) : 0
        } catch (e) {
          // best-effort
        }
      }

      wx.hideLoading()
      if (earned > 0) {
        wx.showToast({ title: t('REWARDS_EARN_TOAST_OK', { N: earned }), icon: 'none' })
      } else {
        wx.showToast({ title: '已点亮今天', icon: 'none' })
      }
      wx.navigateBack({ delta: 1 })
    } catch (e) {
      wx.hideLoading()
      this.setData({ error: e.message || '发布失败' })
    }
  }
})
