Page({
  data: {
    status: 'open',
    items: [],
    loading: false,
    // tags
    tagTypes: [],
    tagsByType: {},
    selectedTagId: '',

    // create
    showCreate: false,
    newTitle: '',
    newNotes: '',
    newSelectedTagIds: [],

    // manage taxonomy
    showAddType: false,
    newTypeName: '',
    showAddTag: false,
    newTagTypeId: '',
    newTagName: ''
  },

  onShow() {
    this.bootstrap()
  },

  async bootstrap() {
    await this.loadTagTaxonomy()
    await this.loadList()
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
    this.setData({ tagTypes, tagsByType })
  },

  async loadList() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const tagIds = this.data.selectedTagId ? [this.data.selectedTagId] : []
      const res = await this.call('date_plan_list', { status: this.data.status, tagIds })
      this.setData({ items: res.items || [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  onToggleStatus(e) {
    const status = e.currentTarget.dataset.status
    if (status === this.data.status) return
    this.setData({ status, selectedTagId: '' }, () => this.loadList())
  },

  onSelectTag(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ selectedTagId: id === this.data.selectedTagId ? '' : id }, () => this.loadList())
  },

  onOpenDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/date/plan-detail/index?id=${encodeURIComponent(id)}` })
  },

  // ----- create plan -----
  openCreate() {
    this.setData({ showCreate: true, newTitle: '', newNotes: '', newSelectedTagIds: [] })
  },
  closeCreate() {
    this.setData({ showCreate: false })
  },
  onNewTitle(e) {
    this.setData({ newTitle: e.detail.value })
  },
  onNewNotes(e) {
    this.setData({ newNotes: e.detail.value })
  },
  toggleNewTag(e) {
    const id = e.currentTarget.dataset.id
    const cur = new Set(this.data.newSelectedTagIds)
    if (cur.has(id)) cur.delete(id)
    else cur.add(id)
    this.setData({ newSelectedTagIds: Array.from(cur) })
  },
  async submitCreate() {
    const title = (this.data.newTitle || '').trim()
    if (!title) {
      wx.showToast({ title: '写个标题吧', icon: 'none' })
      return
    }
    await this.call('date_plan_create', {
      title,
      notes: (this.data.newNotes || '').trim(),
      tagIds: this.data.newSelectedTagIds
    })
    wx.showToast({ title: '已加入清单', icon: 'none' })
    this.closeCreate()
    this.loadList()
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
  }
})
