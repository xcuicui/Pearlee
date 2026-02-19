# Spec Delta: fn-home_feed (mood-curve-end2end-v1)

## ADDED Requirements

### Requirement: Provide 7-day mood aggregation (mood7d)
`home_feed` 响应 MUST 新增字段：`mood7d`，长度固定为 7，按日期升序：

```ts
mood7d: Array<{
  date: string // YYYY-MM-DD
  mood_level?: 1|2|3|4
  lastEntry?: { contentText: string }
}>
```

规则：
- 时间范围：最近 7 天（含今天），按用户本地日期。
- emotion 卡片数据：`emotion`（以及 cards 列表若存在） SHOULD 透传该条 entry 的 `mood_level`（若有），供前端展示 emoji+文案。
- 聚合：同日多条 entries 取 `createdAt` 最新的一条。
- 仅统计带 `mood_level` 的 entries。
- 若某日无 mood：仍保留该日元素，但不包含 `mood_level`。

#### Scenario: Last-of-day aggregation
Given 同一天有两条 entries，且都带 mood_level
And 第二条 createdAt 更新（更晚）
When 调用 `home_feed`
Then `mood7d` 中该日期使用第二条的 mood_level 与摘要

#### Scenario: Day without mood
Given 某一天存在 entries 但都没有 mood_level
When 调用 `home_feed`
Then `mood7d` 中该日期不包含 mood_level
