# Spec: fn-ctx_get

## Purpose
定义获取当前用户关系上下文的云函数行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Relationship Context Query
函数 MUST 查询当前 OPENID 对应的未封存关系。

#### Scenario: Relationship exists
- **GIVEN** OPENID 属于未封存关系
- **WHEN** 调用 `ctx_get`
- **THEN** 返回关系基本信息（id/name/startDate/inviteCode/memberOpenids）

#### Scenario: Relationship missing
- **GIVEN** OPENID 不在任何未封存关系中
- **WHEN** 调用 `ctx_get`
- **THEN** 返回 `relationship: null`

## Data Contracts
### Input
- `event`: 无必填字段

### Output
- Success: `{ ok: true, relationship: null | { id: string, name: string, startDate: string, inviteCode: string, memberOpenids: string[] } }`
