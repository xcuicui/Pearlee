# Spec: fn-relationship_create

## Purpose
定义创建关系与邀请码生成逻辑。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Idempotent Create for Existing Member
函数 MUST 在用户已有关系时直接返回已有关系信息。

#### Scenario: Already in relationship
- **GIVEN** OPENID 已属于未封存关系
- **WHEN** 调用 `relationship_create`
- **THEN** 返回已有关系 `id` 与 `inviteCode`

### Requirement: Relationship Creation
函数 MUST 创建新关系并写入初始成员、名称、邀请码、时间戳。

#### Scenario: Create new relationship
- **GIVEN** OPENID 当前无关系
- **WHEN** 调用 `relationship_create({ name, startDate })`
- **THEN** 新增关系记录并返回新 `id` 与 `inviteCode`

### Requirement: Invite Code Collision Handling
函数 MUST 尝试避免邀请码冲突。

#### Scenario: Invite code duplicate
- **GIVEN** 首次生成的邀请码已存在
- **WHEN** 函数重试生成
- **THEN** 使用新的可用邀请码继续创建

## Data Contracts
### Input
- `name?: string`（清洗后默认 `我们`，最长 12）
- `startDate?: string`（`YYYY-MM-DD` 或空）

### Output
- Success: `{ ok: true, id: string, inviteCode: string }`
- Success (already exists): `{ ok: true, id: string, inviteCode: string }`
