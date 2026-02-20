const { getPointsHelpCopy } = require('../../../utils/pointsHelpCopy')

Page({
  data: {
    titleText: '',
    sourceTitleText: '',
    sourceLines: [],
    usageTitleText: '',
    usageLines: [],
    tipsTitleText: '',
    tipsLines: []
  },

  onLoad() {
    const copy = getPointsHelpCopy()
    wx.setNavigationBarTitle({ title: copy.helpTitle })
    this.setData({
      titleText: copy.helpTitle,
      sourceTitleText: copy.sections.source.title,
      sourceLines: copy.sections.source.lines,
      usageTitleText: copy.sections.usage.title,
      usageLines: copy.sections.usage.lines,
      tipsTitleText: copy.sections.tips.title,
      tipsLines: copy.sections.tips.lines
    })
  }
})
