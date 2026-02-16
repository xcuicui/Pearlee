# Spec: fn-relationship_update (v1.3)

## Purpose
定义关系资料更新能力：
- 更新关系开始日期 startDate
- 更新关系内昵称 nickname_in_relationship

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。

## Requirements
### Requirement: Relationship Ownership Check
函数 MUST 要求调用者属于未封存关系。

#### Scenario: No relationship
- **GIVEN** OPENID 无未封存关系
- **WHEN** 调用 `relationship_update`
- **THEN** 返回业务错误 `NO_REL`

### Requirement: Update start date
#### Scenario: Update startDate
- **GIVEN** 请求带 `startDate=YYYY-MM-DD`
- **WHEN** 调用 `relationship_update({ startDate })`
- **THEN** 更新 Relationship.startDate 并返回成功

### Requirement: Update nickname in relationship
#### Scenario: Update nickname
- **GIVEN** 请求带 `nickname=string`
- **WHEN** 调用 `relationship_update({ nickname })`
- **THEN** 更新 RelationshipMember.nickname_in_relationship（当前用户）并返回成功

## Data Contracts
### Input
- `startDate?: string`（`YYYY-MM-DD` 或空）
- `nickname?: string`（清洗后默认 `我们`，最长 12）

### Output
- Success: `{ ok: true }`
- Errors: `NO_REL`
