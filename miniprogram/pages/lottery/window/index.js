const { t } = require('../../../utils/strings')
const { getGiftPoolWithRarity } = require('../../../utils/giftPool')

Page({
  data: {
    titleText: '',
    subtitleText: '',
    gifts: []
  },

  onLoad() {
    this.setData({
      titleText: t('REWARDS_WINDOW_TITLE'),
      subtitleText: t('REWARDS_WINDOW_SUBTITLE'),
      gifts: getGiftPoolWithRarity()
    })
  }
})
