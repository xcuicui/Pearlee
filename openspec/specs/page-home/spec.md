# Spec: page-home

## Purpose
定义首页在关系存在/不存在场景下的数据加载、情绪卡片展示、月历点亮与路由导航等可验收行为，并明确与云函数契约的一致性。

## Requirements
### Requirement: Home Data Loading
页面 MUST 在展示时调用 `home_feed` 并根据结果更新关系信息、情绪卡片、月历 marks 与今日状态。

#### Scenario: Existing relationship
- **GIVEN** 用户已加入未封存关系
- **WHEN** 打开首页或切换月份后刷新
- **THEN** 页面展示 `relationshipId`、`relationshipName`、`startDate`、`emotion`、`marks`、`today`

#### Scenario: No relationship
- **GIVEN** 用户没有未封存关系
- **WHEN** `home_feed` 返回空关系标识
- **THEN** 页面跳转到关系创建页

### Requirement: Month Navigation
页面 MUST 支持按月切换并按目标年月重新请求首页数据。

#### Scenario: Navigate previous month
- **GIVEN** 当前显示某年某月
- **WHEN** 用户点击上个月
- **THEN** 页面更新年月并重新调用 `home_feed(year, month)`

#### Scenario: Navigate next month
- **GIVEN** 当前显示某年某月
- **WHEN** 用户点击下个月
- **THEN** 页面更新年月并重新调用 `home_feed(year, month)`

### Requirement: Emotion Card Routing
页面 MUST 支持从情绪卡片进入对应日详情，若无可用 entry 则进入发布页。

#### Scenario: Emotion has entry
- **GIVEN** 情绪卡片含 `entryId` 与 `date`
- **WHEN** 用户点击情绪卡片
- **THEN** 页面跳转 `/pages/day/detail?date=<date>&focus=<entryId>`

#### Scenario: Emotion empty
- **GIVEN** 情绪卡片为空
- **WHEN** 用户点击情绪卡片
- **THEN** 页面跳转发布页 `/pages/entry/publish`

## Data Contracts
### Client State
- `relationshipId: string`
- `relName: string`
- `startDate: string (YYYY-MM-DD or empty)`
- `days: number`
- `month: { year: number, month: number }`
- `marks: Record<YYYY-MM-DD, { level: 1 | 2 }>`
- `emotion: { empty: boolean, entryId?: string, date?: string, text?: string, from?: string, timeText?: string }`
- `today: { key: string, hasAny: boolean }`

### Upstream Function Contract
- Request: `home_feed({ year?: number, month?: number })`
- Response: `{ ok: true, relationshipId: string, relationshipName?: string, startDate?: string, marks?: object, emotion?: object, today?: object }`
