Page({
  data: {
    id: '',
    item: null,
    loading: false,

    // tags
    tagTypes: [],
    tagsByType: {},
    hintByTypeName: {},
    editingTags: false,
    editSelectedTagIds: [],

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

    this.setData({ tagTypes, tagsByType, hintByTypeName })
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
    this.setData({ editingTags: true, editSelectedTagIds: ids.slice() })
  },
  closeEditTags() {
    this.setData({ editingTags: false })
  },
  toggleEditTag(e) {
    const id = String(e && e.currentTarget && e.currentTarget.dataset ? (e.currentTarget.dataset.id || '') : '').trim()
    if (!id) return
    const cur = new Set((this.data.editSelectedTagIds || []).map(x => String(x)))
    if (cur.has(id)) cur.delete(id)
    else cur.add(id)
    this.setData({ editSelectedTagIds: Array.from(cur) })
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
        this.setData({ editSelectedTagIds: Array.from(cur) })
        wx.showToast({ title: '已删除', icon: 'none' })
        await this.loadTagTaxonomy()
        await this.loadItem()
      }
    })
  }
})
