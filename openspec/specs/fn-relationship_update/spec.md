# Spec: fn-relationship_update

## Purpose
定义关系资料更新（名称、纪念日）的能力。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Relationship Ownership Check
函数 MUST 要求调用者属于未封存关系。

#### Scenario: No relationship
- **GIVEN** OPENID 无未封存关系
- **WHEN** 调用 `relationship_update`
- **THEN** 返回业务错误 `NO_REL`

### Requirement: Patch Update
函数 MUST 支持按字段更新 `name` 与 `startDate` 并更新时间戳。

#### Scenario: Update name and date
- **GIVEN** 请求带 `name` 与 `startDate`
- **WHEN** 调用 `relationship_update`
- **THEN** 更新关系并返回成功

### Requirement: Update nickname in relationship
函数 MUST 支持更新关系内昵称。

#### Scenario: Save nickname
- **GIVEN** nickname 非空
- **WHEN** 调用 `relationship_update({ nickname })`
- **THEN** 更新当前用户的 relationship member nickname

## Data Contracts
### Input
- `name?: string`（清洗后默认 `我们`，最长 12）
- `startDate?: string`（`YYYY-MM-DD` 或空）

### Output
- Success: `{ ok: true }`
- Errors: `NO_REL`
