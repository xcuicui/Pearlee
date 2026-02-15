# Spec: fn-relationship_archive

## Purpose
定义关系封存行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Active Relationship Required
函数 MUST 仅在调用者存在未封存关系时执行。

#### Scenario: No active relationship
- **GIVEN** OPENID 无未封存关系
- **WHEN** 调用 `relationship_archive`
- **THEN** 返回业务错误 `NO_REL`

### Requirement: Archive Update
函数 MUST 将关系标记为 `archived: true` 并更新时间。

#### Scenario: Archive success
- **GIVEN** 调用者属于未封存关系
- **WHEN** 调用 `relationship_archive`
- **THEN** 关系状态变为封存并返回成功

## Data Contracts
### Input
- `event`: 无必填字段

### Output
- Success: `{ ok: true }`
- Errors: `NO_REL`
