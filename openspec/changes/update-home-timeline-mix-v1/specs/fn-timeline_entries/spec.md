## ADDED Requirements

### Requirement: timeline_entries supports mixed items
云函数 `timeline_entries` MUST 支持返回混排 items，且每条 item MUST 包含 `type` 字段：`murmur` 或 `dateDiary`。

#### Scenario: Mixed items include type
- **WHEN** 调用 `timeline_entries(...)`
- **THEN** 返回 `{ ok: true, items: Array<TimelineItem> }`
- **AND** 每条 item 包含 `id,type,text,images,createdAt,date`

#### Scenario: Date diary fields
- **GIVEN** 某条 item.type = 'dateDiary'
- **WHEN** 返回该条 item
- **THEN** item MAY 包含 `occurAt` 与 `planId/planTitle`
- **AND** item.date MUST 由 occurAt（优先）或 createdAt 计算得到的本地日期（YYYY-MM-DD）
