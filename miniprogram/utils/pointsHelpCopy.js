const POINTS_HELP_PATH = '/pages/lottery/points-help/index'

const pointsHelpCopy = {
  linkText: '贝壳说明',
  helpTitle: '贝壳说明',
  sections: {
    source: {
      title: '贝壳从哪里来',
      lines: [
        '• 想念打卡固定获得 3 枚贝壳',
        '• 发布碎碎念可获得 2~16 枚贝壳（与文字长度/图片数量有关）',
        '• 完成页面中的部分任务也可能获得贝壳'
      ]
    },
    usage: {
      title: '贝壳怎么用',
      lines: [
        '• 抽一次小礼物消耗 1 枚贝壳',
        '• 消耗后可获得小礼物券',
        '• 可在券包中查看小礼物券',
        '• 再打开一份小礼物'
      ]
    },
    tips: {
      title: '温馨提示',
      lines: [
        '• 贝壳与小礼物券仅用于应用内互动体验',
        '• 暂不支持提现、转赠等站外流转'
      ]
    }
  },
  checkinTip: '想念打卡固定获得 3 枚贝壳',
  publishTip: '发布碎碎念可获得 2~16 枚贝壳'
}

function getPointsHelpCopy() {
  return pointsHelpCopy
}

module.exports = {
  POINTS_HELP_PATH,
  getPointsHelpCopy
}
