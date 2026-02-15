# Spec: page-day-detail

## Purpose
定义日详情页对某日记录列表展示、点赞切换、单条回应提交的可验收行为，并明确聚合数据字段与互动约束（每条仅 1 条回应）。

## Requirements
### Requirement: Day Entries Loading
页面 MUST 根据 `date` 查询日记录并展示聚合字段。

#### Scenario: Load entries
- **GIVEN** 页面收到 `date` 参数
- **WHEN** 页面显示并调用 `day_entries({ date })`
- **THEN** 页面展示按时间排序的 entry 列表及点赞数、点赞态、评论

### Requirement: Like Toggle
页面 MUST 支持对单条 entry 切换点赞后刷新列表。

#### Scenario: Toggle like
- **GIVEN** 用户点击某条 entry 的点赞按钮
- **WHEN** 页面调用 `like_toggle({ entryId })`
- **THEN** 页面重新加载当日列表

### Requirement: Single Comment Submission
页面 MUST 支持输入回应并提交，且提交成功后清空草稿并刷新。

#### Scenario: Empty comment blocked
- **GIVEN** 草稿为空
- **WHEN** 用户点击发送回应
- **THEN** 页面提示“写点回应吧”并阻止提交

#### Scenario: Comment success
- **GIVEN** 草稿非空
- **WHEN** 页面调用 `comment_set({ entryId, content })` 成功
- **THEN** 页面清空该条草稿并重新加载列表

## Data Contracts
### Route Params
- `date: string (YYYY-MM-DD)`
- `focus?: string`

### Client State
- `items: Array<{ id: string, text: string, createdAt: number, timeText: string, likeCount: number, liked: boolean, comment: null | { id: string, content: string, userOpenid: string, createdAt: number } }>`
- `draft: Record<entryId, string>`
- `error: string`

### Upstream Function Contracts
- `day_entries({ date: string }): { ok: true, items: Array<EntryView> }`
- `like_toggle({ entryId: string }): { ok: true, liked: boolean }`
- `comment_set({ entryId: string, content: string }): { ok: true, id: string }`
