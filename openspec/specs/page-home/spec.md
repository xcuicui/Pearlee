# Spec: page-home (v1.3)

## Purpose
定义首页（周历）在关系存在/不存在场景下的数据加载、周历条展示与滑动、情绪卡片展示优先级与路由、连续天数展示、今日入口状态与导航。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。

## Requirements
### Requirement: Home Data Loading
页面 MUST 在展示时调用 `home_feed` 并根据结果更新：关系昵称、天数、连续、周历数据、情绪卡片与今日状态。

#### Scenario: Existing relationship
- **GIVEN** 用户已加入未封存关系
- **WHEN** 打开首页
- **THEN** 页面调用 `home_feed()`
- **AND** 页面展示 `nickname`、`daysSinceStart`、`streak`、`week`、`emotion`、`today`

#### Scenario: No relationship
- **GIVEN** 用户没有未封存关系
- **WHEN** `home_feed` 返回空关系标识
- **THEN** 页面跳转到关系创建页

### Requirement: Top Time Area
页面 MUST 展示“时间是主角”的顶部信息。

#### Scenario: Days since start
- **GIVEN** `daysSinceStart` 已计算
- **WHEN** 渲染顶部
- **THEN** 展示文案：`和 {nickname} 的第 {daysSinceStart} 天`

#### Scenario: Streak visible
- **GIVEN** `streak.visible=true`
- **WHEN** 渲染顶部
- **THEN** 展示文案：`最近 {streak.current} 天都有记录`

- **GIVEN** `streak.visible=false`
- **WHEN** 渲染顶部
- **THEN** 不展示连续文案

### Requirement: Week Bar Rendering
页面 MUST 展示当周（周一开始）的 7 天周历条，并表达三种状态：有记录、今日、今日+有记录。

#### Scenario: Has record
- **GIVEN** 某日 `date` 存在于 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 该日展示底部圆点标记

#### Scenario: Today
- **GIVEN** `date === week.todayKey`
- **WHEN** 渲染周历
- **THEN** 该日展示外圈描边

#### Scenario: Today + record
- **GIVEN** `date === week.todayKey` 且 `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 同时展示描边与圆点

### Requirement: Week Bar Navigation (Swipe)
页面 MUST 支持左右滑动切换周。

#### Scenario: Swipe to previous week
- **GIVEN** 当前周 `week.start`
- **WHEN** 用户向右滑动（上一周）
- **THEN** 页面以 `weekStart = week.start - 7 days` 重新调用 `home_feed({ weekStart })`

#### Scenario: Swipe to next week
- **GIVEN** 当前周 `week.start`
- **WHEN** 用户向左滑动（下一周）
- **THEN** 页面以 `weekStart = week.start + 7 days` 重新调用 `home_feed({ weekStart })`

### Requirement: Day Routing
#### Scenario: Select day
- **GIVEN** 用户点击周历某日 `date`
- **WHEN** 点击日期
- **THEN** 页面跳转 `/pages/day/detail?date=<date>`

### Requirement: Emotion Card Priority Display
页面 MUST 展示情绪卡片，体现“现在优先”。

#### Scenario: Emotion has entry
- **GIVEN** `emotion.empty=false` 且包含 `date` 与 `entryId`
- **WHEN** 渲染情绪卡片
- **THEN** 展示：`来自 {emotion.nickname}`、`emotion.text`、`emotion.timeText`（或月日）

#### Scenario: Emotion empty
- **GIVEN** `emotion.empty=true`
- **WHEN** 渲染情绪卡片
- **THEN** 展示空态引导文案（如“写一句给 TA 的话吧。”）

### Requirement: Emotion Card Routing
#### Scenario: Emotion has entry
- **GIVEN** 情绪卡片含 `entryId` 与 `date`
- **WHEN** 用户点击情绪卡片
- **THEN** 页面跳转 `/pages/day/detail?date=<date>&focus=<entryId>`

#### Scenario: Emotion empty
- **GIVEN** 情绪卡片为空
- **WHEN** 用户点击情绪卡片
- **THEN** 页面跳转发布页 `/pages/entry/publish`

### Requirement: Today CTA
页面 MUST 根据 `today.hasAny` 渲染入口区。

#### Scenario: Today has no entry
- **GIVEN** `today.hasAny=false`
- **WHEN** 渲染入口
- **THEN** 展示“今天还没有留下记录”与按钮“留下点什么”

#### Scenario: Today has entry
- **GIVEN** `today.hasAny=true`
- **WHEN** 渲染入口
- **THEN** 展示“今天已经被点亮”与按钮“再写一句”

## Data Contracts
### Client State
- `relationshipId: string`
- `nickname: string`
- `startDate: string`
- `daysSinceStart: number`
- `streak: { current: number, visible: boolean }`
- `week: { start: string, end: string, activeDates: string[], todayKey: string, levelByDate?: object }`
- `emotion: { empty: boolean, entryId?: string, date?: string, text?: string, nickname?: string, from?: string, timeText?: string, coverImage?: string }`
- `today: { key: string, hasAny: boolean }`

### Upstream Function Contract
- `home_feed({ weekStart?: string }): { ok: true, relationshipId: string, ... }`
