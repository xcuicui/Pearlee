# Change: Refine Week Bar Visual (Make it look like a "week strip" not a calendar)

## Why
当前周历虽然只展示 7 天，但视觉气质仍偏“日历格子”，像把月历裁成一行。v1.3 的定位需要「时间是主角、现在优先、轻量记录」，周历应更像一条安静的时间刻度/周条（week strip），可一眼感知“这一周有没有被点亮”。

## What Changes
- 不改数据与交互：仍是周一开始 7 天、点击进日详情、左右滑动切周。
- 仅调整周历条视觉语言：
  - 去“格子感”：弱化单元格块状背景
  - 强化时间条：缩小信息密度（周几/日号/状态）
  - 今日状态：使用更克制的 ring（细描边/淡底）
  - 有记录：底部点更明显但低饱和；level=2 更强（更实/双点/更大）

## Impact
- Affected specs: page-home
- Affected code: miniprogram/pages/home/index.wxml + index.wxss (+少量 index.js 若需要 level=2 状态映射)

## Non-Goals
- 不引入月历
- 不引入新的统计或激励机制
