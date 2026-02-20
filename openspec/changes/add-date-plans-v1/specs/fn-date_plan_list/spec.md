## ADDED Requirements

### Requirement: List date plans by status
云函数 `date_plan_list` MUST 支持按状态返回当前关系下的清单项列表。

#### Scenario: List open
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `date_plan_list({ status: 'open' })`
- **THEN** 返回 `{ ok: true, items: Array<DatePlanView> }`
- **AND** `items` 中每条包含 `id,title,notes?,status,createdAt,doneAt?,logCount,lastOccurAt?`
