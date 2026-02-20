Page({
  data: {
    id: '',
    item: null,
    loading: false,

    diaries: [],
    diaryLoading: false,

    // tags
    tagTypes: [],
    tagsByType: {},
    hintByTypeName: {},
    typeColorStyleById: {},
    editingTags: false,
    editSelectedTagIds: [],
    editSelectedTagMap: {},

    // add taxonomy
    showAddType: false,
    newTypeName: '',
    showAddTag: false,
    newTagTypeId: '',
    newTagName: ''
  },

  onLoad(query) {
    const id = query.id || ''
    this.setData({ id })
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
    await this.loadTagTaxonomy()
    await this.loadItem()
    await this.loadDiaries()
  },

  async loadTagTaxonomy() {
    const [typesRes, tagsRes] = await Promise.all([
      this.call('date_tag_type_list', {}),
      this.call('date_tag_list', {})
    ])
    const tagTypes = typesRes.items || []
    const tags = tagsRes.items || []
    const tagsByType = {}
    for (const t of tagTypes) tagsByType[t.id] = []
    for (const tag of tags) {
      if (!tagsByType[tag.typeId]) tagsByType[tag.typeId] = []
      tagsByType[tag.typeId].push(tag)
    }

    const hintByTypeName = {
      '地点': '比如：深圳 / 广州 / 上海',
      '氛围': '比如：松弛 / 浪漫 / 热闹'
    }

    const palette = [
      { bg: 'rgba(95,125,149,.14)', bd: 'rgba(95,125,149,.28)', fg: 'rgba(31,59,82,.95)' },
      { bg: 'rgba(255,170,190,.18)', bd: 'rgba(255,170,190,.40)', fg: 'rgba(120,43,63,.92)' },
      { bg: 'rgba(121,199,146,.18)', bd: 'rgba(121,199,146,.40)', fg: 'rgba(22,80,44,.92)' },
      { bg: 'rgba(180,160,255,.16)', bd: 'rgba(180,160,255,.36)', fg: 'rgba(54,40,120,.92)' },
      { bg: 'rgba(255,208,112,.18)', bd: 'rgba(255,208,112,.42)', fg: 'rgba(120,80,10,.92)' }
    ]
    const typeColorStyleById = {}
    tagTypes.forEach((t, idx) => {
      const c = palette[idx % palette.length]
      typeColorStyleById[t.id] = `background:${c.bg};border:2rpx solid ${c.bd};color:${c.fg};`
    })

    this.setData({ tagTypes, tagsByType, hintByTypeName, typeColorStyleById })
  },

  async loadItem() {
    if (!this.data.id) return
    this.setData({ loading: true })
    try {
      // reuse list API for now, fetch both statuses and find
      const [openRes, doneRes] = await Promise.all([
        this.call('date_plan_list', { status: 'open', limit: 200 }),
        this.call('date_plan_list', { status: 'done', limit: 200 })
      ])
      const all = (openRes.items || []).concat(doneRes.items || [])
      const item = all.find(x => x.id === this.data.id) || null
      this.setData({ item, editSelectedTagIds: (item && item.tagIds) ? item.tagIds : [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  pad2(n) { return String(n).padStart(2, '0') },
  formatOccurAt(ts) {
    const n = Number(ts || 0)
    if (!n) return ''
    const d = new Date(n)
    if (Number.isNaN(d.getTime())) return ''
    return `${d.getMonth() + 1}月${d.getDate()}日 ${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`
  },

  async loadDiaries() {
    if (!this.data.id) return
    if (this.data.diaryLoading) return
    this.setData({ diaryLoading: true })
    try {
      const res = await this.call('date_diary_list_by_plan', { planId: this.data.id, limit: 30 })
      const items = Array.isArray(res.items) ? res.items : []
      const diaries = items.map(x => ({
        id: x.id,
        occurAt: x.occurAt,
        occurText: this.formatOccurAt(x.occurAt),
        text: String(x.text || ''),
        images: Array.isArray(x.images) ? x.images.slice(0, 3) : []
      }))
      this.setData({ diaries })
    } catch (e) {
      // best-effort
      this.setData({ diaries: [] })
    } finally {
      this.setData({ diaryLoading: false })
    }
  },

  async toggleDone() {
    const item = this.data.item
    if (!item) return
    const done = item.status !== 'done'
    await this.call('date_plan_done', { planId: item.id, done })
    wx.showToast({ title: done ? '已完成' : '已取消完成', icon: 'none' })
    await this.loadItem()
  },

  goDiaryCreate() {
    if (!this.data.id) return
    wx.navigateTo({ url: `/pages/date/diary-create/index?planId=${encodeURIComponent(this.data.id)}` })
  },

  // ----- edit tags -----
  openEditTags() {
    const ids = (this.data.item && this.data.item.tagIds) ? this.data.item.tagIds : []
    const list = ids.map(x => String(x))
    const map = Object.create(null)
    for (const id of list) map[id] = true
    this.setData({ editingTags: true, editSelectedTagIds: list, editSelectedTagMap: map })
  },
  closeEditTags() {
    this.setData({ editingTags: false, editSelectedTagMap: {} })
  },
  toggleEditTag(e) {
    const id = String(e && e.currentTarget && e.currentTarget.dataset ? (e.currentTarget.dataset.id || '') : '').trim()
    if (!id) return

    const cur = new Set((this.data.editSelectedTagIds || []).map(x => String(x)))
    if (cur.has(id)) cur.delete(id)
    else cur.add(id)

    const list = Array.from(cur)
    const map = Object.create(null)
    for (const x of list) map[x] = true

    this.setData({ editSelectedTagIds: list, editSelectedTagMap: map })
  },
  async saveTags() {
    await this.call('date_plan_update', { planId: this.data.id, tagIds: this.data.editSelectedTagIds })
    wx.showToast({ title: '已更新标签', icon: 'none' })
    this.closeEditTags()
    await this.loadItem()
  },

  // ----- taxonomy management -----
  openAddType() {
    this.setData({ showAddType: true, newTypeName: '' })
  },
  closeAddType() {
    this.setData({ showAddType: false })
  },
  onNewTypeName(e) {
    this.setData({ newTypeName: e.detail.value })
  },
  async submitAddType() {
    const name = (this.data.newTypeName || '').trim()
    if (!name) return wx.showToast({ title: '写个类型名', icon: 'none' })
    await this.call('date_tag_type_create', { name })
    wx.showToast({ title: '已新增类型', icon: 'none' })
    this.closeAddType()
    await this.loadTagTaxonomy()
  },
  openAddTag(e) {
    const typeId = e.currentTarget.dataset.typeid
    this.setData({ showAddTag: true, newTagTypeId: typeId, newTagName: '' })
  },
  closeAddTag() {
    this.setData({ showAddTag: false })
  },
  onNewTagName(e) {
    this.setData({ newTagName: e.detail.value })
  },
  async submitAddTag() {
    const name = (this.data.newTagName || '').trim()
    if (!name) return wx.showToast({ title: '写个标签名', icon: 'none' })
    await this.call('date_tag_create', { typeId: this.data.newTagTypeId, name })
    wx.showToast({ title: '已新增标签', icon: 'none' })
    this.closeAddTag()
    await this.loadTagTaxonomy()
  },

  onLongPressTag(e) {
    const tagId = e.currentTarget.dataset.id
    const tagName = e.currentTarget.dataset.name
    if (!tagId) return

    wx.showActionSheet({
      itemList: ['删除标签'],
      success: async (res) => {
        if (!res || res.tapIndex !== 0) return
        const ok = await new Promise(resolve => {
          wx.showModal({
            title: '删除标签',
            content: `确定删除“${tagName || ''}”吗？`,
            confirmText: '删除',
            confirmColor: '#d14343',
            success: (r) => resolve(!!(r && r.confirm)),
            fail: () => resolve(false)
          })
        })
        if (!ok) return
        await this.call('date_tag_delete', { tagId })
        // remove from current selected list
        const cur = new Set((this.data.editSelectedTagIds || []).map(x => String(x)))
        cur.delete(String(tagId))
        const list = Array.from(cur)
        const map = Object.create(null)
        for (const x of list) map[x] = true
        this.setData({ editSelectedTagIds: list, editSelectedTagMap: map })
        wx.showToast({ title: '已删除', icon: 'none' })
        await this.loadTagTaxonomy()
        await this.loadItem()
      }
    })
  },

  onLongPressType(e) {
    const typeId = e.currentTarget.dataset.typeid
    const typeName = e.currentTarget.dataset.name
    if (!typeId) return

    wx.showActionSheet({
      itemList: ['删除类型'],
      success: async (res) => {
        if (!res || res.tapIndex !== 0) return
        const ok = await new Promise(resolve => {
          wx.showModal({
            title: '删除标签类型',
            content: `确定删除「${typeName || ''}」吗？该类型下的标签也会一起删除。`,
            confirmText: '删除',
            confirmColor: '#d14343',
            success: (r) => resolve(!!(r && r.confirm)),
            fail: () => resolve(false)
          })
        })
        if (!ok) return

        await this.call('date_tag_type_delete', { typeId })
        wx.showToast({ title: '已删除', icon: 'none' })

        // refresh taxonomy + item (in case tags were removed)
        await this.loadTagTaxonomy()
        await this.loadItem()

        // keep editor state in sync
        const selected = new Set((this.data.editSelectedTagIds || []).map(x => String(x)))
        // After taxonomy reload, remove any selected ids that no longer exist
        const allTagIds = []
        const byType = this.data.tagsByType || {}
        Object.keys(byType).forEach(k => (byType[k] || []).forEach(tag => allTagIds.push(String(tag.id))))
        const exists = new Set(allTagIds)
        const next = Array.from(selected).filter(id => exists.has(id))
        const map = Object.create(null)
        for (const id of next) map[id] = true
        this.setData({ editSelectedTagIds: next, editSelectedTagMap: map })
      }
    })
  }
})
