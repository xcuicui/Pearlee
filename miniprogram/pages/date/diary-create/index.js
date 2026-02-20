const MAX_IMAGES = 3

function pad2(n) { return String(n).padStart(2, '0') }

function formatDateYmd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatTimeHm(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function ymdToParts(ymd) {
  const m = String(ymd || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return { y: Number(m[1]), mo: Number(m[2]), d: Number(m[3]) }
}

function weekdayCN(ymd) {
  const p = ymdToParts(ymd)
  if (!p) return ''
  const d = new Date(p.y, p.mo - 1, p.d)
  if (Number.isNaN(d.getTime())) return ''
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return `周${labels[d.getDay()]}`
}

function metaDateText(ymd) {
  const p = ymdToParts(ymd)
  if (!p) return ''
  return `${p.y}.${pad2(p.mo)}.${pad2(p.d)}`
}

// (removed) big day number per design feedback

function extOf(path) {
  const s = String(path || '')
  const m = s.match(/(\.[a-zA-Z0-9]+)(?:\?|$)/)
  return m ? m[1].toLowerCase() : '.jpg'
}

function makeCloudPath(localPath, i) {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  return `date_diaries/${ts}_${i}_${rand}${extOf(localPath)}`
}

function getImageInfo(filePath) {
  return new Promise((resolve) => {
    wx.getImageInfo({
      src: filePath,
      success: (res) => resolve({ path: filePath, width: Number(res.width || 0), height: Number(res.height || 0) }),
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
    if (Number(width) > 1080) options.compressedWidth = 1080
    wx.compressImage(options)
  })
}

Page({
  data: {
    // naming
    taNickname: '对方',

    // plan association
    plans: [],
    planId: '',
    planTitle: '',
    useTemporary: false,
    showPlanPicker: false,

    // occur time
    occurDate: '',
    occurTime: '',
    metaDateText: '',
    metaWeekText: '',

    // content
    text: '',
    images: [],
    canSubmit: false
  },

  noop() {},

  onLoad(query) {
    const now = new Date()
    const occurDate = formatDateYmd(now)
    const occurTime = formatTimeHm(now)
    const planId = query.planId ? String(query.planId) : ''

    this.setData({ occurDate, occurTime, planId })
    this.recomputeMeta()
    this.recompute()

    // best-effort partner nickname
    wx.cloud.callFunction({ name: 'ctx_get', data: {} })
      .then((res) => {
        const ctx = res && res.result ? res.result : null
        const rel = ctx && ctx.relationship ? ctx.relationship : null
        const nickname = rel && rel.partner ? String(rel.partner.nickname || '').trim() : ''
        if (nickname) this.setData({ taNickname: nickname })
      })
      .catch(() => {})
  },

  onShow() {
    this.bootstrap()
  },

  async call(name, data) {
    try {
      const res = await wx.cloud.callFunction({ name, data })
      return res.result || {}
    } catch (e) {
      console.error(name, e)
      wx.showToast({ title: (e && e.message) || '请求失败', icon: 'none' })
      throw e
    }
  },

  async bootstrap() {
    // load open plans for association
    const res = await this.call('date_plan_list', { status: 'open', limit: 200 })
    const plans = res.items || []

    let planId = this.data.planId
    let useTemporary = this.data.useTemporary
    let planTitle = ''

    if (planId) {
      const hit = plans.find(p => p.id === planId)
      if (hit) planTitle = hit.title
      else planId = ''
    }

    this.setData({ plans, planId, planTitle, useTemporary })
    this.recompute()
  },

  recomputeMeta() {
    const occurDate = this.data.occurDate
    this.setData({
      metaDateText: metaDateText(occurDate),
      metaWeekText: weekdayCN(occurDate)
    })
  },

  recompute() {
    const hasText = String(this.data.text || '').trim().length > 0
    const hasImages = Array.isArray(this.data.images) && this.data.images.length > 0
    const hasPlan = !!this.data.planId
    const allowTemp = !!this.data.useTemporary

    this.setData({
      canSubmit: (hasText || hasImages) && (hasPlan || allowTemp)
    })
  },

  onText(e) {
    this.setData({ text: e && e.detail ? String(e.detail.value || '') : '' })
    this.recompute()
  },

  openPlanPicker() {
    this.setData({ showPlanPicker: true })
  },

  closePlanPicker() {
    this.setData({ showPlanPicker: false })
  },

  onPickPlan(e) {
    const planId = e.currentTarget.dataset.id
    const plan = (this.data.plans || []).find(p => p.id === planId)
    this.setData({ planId, planTitle: plan ? plan.title : '', useTemporary: false, showPlanPicker: false })
    this.recompute()
  },

  onUseTemporary() {
    this.setData({ useTemporary: true, planId: '', planTitle: '', showPlanPicker: false })
    this.recompute()
  },

  onPickOccurDate(e) {
    this.setData({ occurDate: e.detail.value })
    this.recomputeMeta()
  },

  onPickOccurTime(e) {
    this.setData({ occurTime: e.detail.value })
  },

  chooseImages() {
    const current = Array.isArray(this.data.images) ? this.data.images : []
    const remain = MAX_IMAGES - current.length
    if (remain <= 0) {
      wx.showToast({ title: '最多 3 张图片', icon: 'none' })
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
        this.setData({ images: next })
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

  occurAtTs() {
    const ymd = String(this.data.occurDate || '').trim()
    const hm = String(this.data.occurTime || '').trim()
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const t = hm.match(/^(\d{2}):(\d{2})$/)
    if (!m || !t) return 0
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(t[1]), Number(t[2]))
    const ts = d.getTime()
    return Number.isNaN(ts) ? 0 : ts
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
      return { url: uploaded.fileID, width: Number(img.width || 0), height: Number(img.height || 0) }
    })
    return Promise.all(tasks)
  },

  async onSubmit() {
    if (!this.data.canSubmit) return

    const occurAt = this.occurAtTs()
    if (!occurAt) {
      wx.showToast({ title: '选一个时间', icon: 'none' })
      return
    }

    const text = String(this.data.text || '').trim()
    const planId = this.data.useTemporary ? '' : String(this.data.planId || '')

    try {
      wx.showLoading({ title: '保存中' })
      const images = await this.uploadSelectedImages()
      await this.call('date_diary_create', { planId, occurAt, text, images })
      wx.hideLoading()
      wx.showToast({ title: '把这一天留下了', icon: 'none' })
      wx.navigateBack({ delta: 1 })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: (e && e.message) || '保存失败', icon: 'none' })
    }
  }
})
