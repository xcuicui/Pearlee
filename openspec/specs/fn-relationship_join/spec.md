# Spec: fn-relationship_join

## Purpose
定义通过邀请码加入关系的校验和写入行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Invite Code Validation
函数 MUST 校验邀请码非空并转大写。

#### Scenario: Empty invite code
- **GIVEN** 邀请码为空
- **WHEN** 调用 `relationship_join`
- **THEN** 返回业务错误 `EMPTY_CODE`

### Requirement: Join Existing Relationship Guard
函数 MUST 在调用者已有关系时幂等返回。

#### Scenario: Caller already in relationship
- **GIVEN** OPENID 已属于某未封存关系
- **WHEN** 调用 `relationship_join`
- **THEN** 直接返回现有关系 id

### Requirement: Membership Limit
函数 MUST 限制关系成员最多 2 人。

#### Scenario: Relationship full
- **GIVEN** 目标关系 `memberOpenids` 已有 2 人
- **WHEN** 新用户尝试加入
- **THEN** 返回业务错误 `FULL`

### Requirement: Join Success
函数 MUST 将 OPENID 追加为新成员并更新时间。

#### Scenario: Join by valid invite
- **GIVEN** 邀请码有效且关系未满
- **WHEN** 调用 `relationship_join({ inviteCode })`
- **THEN** 更新关系成员并返回关系 id

## Data Contracts
### Input
- `inviteCode: string`

### Output
- Success: `{ ok: true, id: string }`
- Errors: `EMPTY_CODE | INVALID_CODE | FULL`
