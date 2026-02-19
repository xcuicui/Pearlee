# Spec Delta: page-home (mood-curve-end2end-v1)

## MODIFIED Requirements

### Requirement: MoodTrendOverlay in week calendar
首页周历区域内 MUST 新增 `MoodTrendOverlay`（不新增独立模块卡片）：
- 展示最近 7 天点线趋势（仅有 mood 的日显示点/线）
- 不显示任何 y 轴/数字刻度/分数

#### Scenario: Trend shows only for mood days
Given 最近 7 天中有 3 天记录了 mood
When 我打开首页
Then 周历中仅这 3 天显示点位
And 点位之间的线段仅连接有 mood 的连续点

## ADDED Requirements

### Requirement: Emotion card shows mood when available
当首页顶部「情绪卡片 / emotion 卡」展示某条碎碎念时，页面 MUST 满足：
- 若该条碎碎念包含 `mood_level`：卡片 MUST 展示 `emoji + 文案`（例如：`☀ 温暖`）
- 若无 `mood_level`：不展示心情
- 不显示任何数字/刻度

#### Scenario: Emotion card shows mood
Given 情绪卡片展示的碎碎念包含 mood_level=4
When 我打开首页
Then 该卡片展示「✨ 很开心」

#### Scenario: Emotion card hides mood when missing
Given 情绪卡片展示的碎碎念没有 mood_level
When 我打开首页
Then 该卡片不展示心情

### Requirement: Tap day opens that day’s entries
点击周历中的日期格（包含点位所在日期格） MUST 打开该日期的碎碎念列表页：

- MUST `wx.navigateTo` 进入：`/pages/day/detail?date=YYYY-MM-DD`
- MUST 不弹出心情弹窗（避免破坏原有交互）

#### Scenario: Tap day navigates
Given 今天是 2026-02-19
When 我点击周历中的 2026-02-19
Then 页面跳转到 `/pages/day/detail?date=2026-02-19`
