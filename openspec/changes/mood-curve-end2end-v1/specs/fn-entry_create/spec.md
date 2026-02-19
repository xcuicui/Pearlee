# Spec Delta: fn-entry_create (mood-curve-end2end-v1)

## MODIFIED Requirements

### Requirement: Persist mood_level in entries
`entry_create` MUST 新增输入参数：`mood_level: 1|2|3|4`。

当客户端传入 `mood_level` 时：
- 必须校验为 1~4 的整数
- 必须写入 `entries.mood_level`

#### Scenario: Create entry with mood
Given 客户端请求 `entry_create` 并携带 `mood_level=4`
When 云函数写入 entries
Then entries 文档包含 `mood_level=4`

#### Scenario: Reject invalid mood_level
Given 客户端请求 `entry_create` 并携带 `mood_level=5`
When 云函数校验参数
Then 返回业务错误
