# Spec Delta: fn-day_entries (mood-curve-end2end-v1)

## MODIFIED Requirements

### Requirement: Day Entries Query includes mood_level
`day_entries` 返回的每条 entry 视图 MUST 包含该条 entry 的 `mood_level`（若有）。

- `mood_level` MUST 为 `1|2|3|4`，或缺省/不存在
- 旧数据无 `mood_level` 时 MUST 不强行补默认值

#### Scenario: Entry with mood_level
Given 当天存在一条 entry 记录了 `mood_level=3`
When 调用 `day_entries({ date })`
Then 返回 items 中该条 entry 包含 `mood_level=3`

#### Scenario: Entry without mood_level
Given 当天存在一条历史 entry 没有 `mood_level`
When 调用 `day_entries({ date })`
Then 返回该条 entry 不包含 `mood_level`（或为空/缺省）
