## ADDED Requirements
### Requirement: Week Bar Rendering
首页 MUST 展示周历条（周一开始 7 天）并表达三种状态：有记录、今日、今日+有记录。

#### Scenario: Has record
- **GIVEN** `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 该日展示底部圆点

#### Scenario: Today
- **GIVEN** `date === week.todayKey`
- **WHEN** 渲染周历
- **THEN** 该日展示外圈描边

#### Scenario: Today + record
- **GIVEN** `date === week.todayKey` 且 `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 同时展示描边与圆点

### Requirement: Week Bar Navigation (Swipe)
首页 MUST 支持左右滑动切换周并重新请求 home_feed。

#### Scenario: Swipe prev week
- **GIVEN** 当前周 start
- **WHEN** 向右滑动
- **THEN** `weekStart = start - 7 days` 调用 `home_feed({ weekStart })`

#### Scenario: Swipe next week
- **GIVEN** 当前周 start
- **WHEN** 向左滑动
- **THEN** `weekStart = start + 7 days` 调用 `home_feed({ weekStart })`

### Requirement: Streak Copy
首页 MUST 在 streak>=2 时展示连续文案。

#### Scenario: Show streak
- **GIVEN** `streak.visible=true`
- **WHEN** 渲染顶部
- **THEN** 展示“最近 {N} 天都有记录”
