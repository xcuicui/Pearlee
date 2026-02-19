# Spec Delta: page-home (murmur-day-to-global-timeline-v1)

## MODIFIED Requirements

### Requirement: Week day tap opens global timeline anchored to that date
周历点击某一天 MUST 打开全量碎碎念时间线页，并携带 anchorDate：

- MUST `wx.navigateTo` 到 `/pages/murmur/timeline/index?anchorDate=<YYYY-MM-DD>&entry=calendar`
- MUST 以用户点击的日期作为 anchorDate（用户本地日期）

#### Scenario: Tap day navigates to timeline
Given 首页周历显示日期 2026-02-19
When 我点击该日期格
Then 页面跳转到 `/pages/murmur/timeline/index?anchorDate=2026-02-19&entry=calendar`
