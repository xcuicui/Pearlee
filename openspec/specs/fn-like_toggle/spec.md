# Spec: fn-like_toggle

## Purpose
定义 entry 点赞开关（toggle）能力。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Relationship and Entry Validation
函数 MUST 校验调用者关系存在、entryId 存在且条目归属当前关系。

#### Scenario: Missing entry id
- **GIVEN** 未传 entryId
- **WHEN** 调用 `like_toggle`
- **THEN** 返回业务错误 `MISSING_ID`

#### Scenario: Forbidden relationship
- **GIVEN** entry 不属于当前关系
- **WHEN** 调用 `like_toggle`
- **THEN** 返回业务错误 `FORBIDDEN`

### Requirement: Toggle Like State
函数 MUST 在已点赞时取消点赞，未点赞时新增点赞。

#### Scenario: Unlike existing like
- **GIVEN** 当前用户已点赞该 entry
- **WHEN** 调用 `like_toggle`
- **THEN** 删除点赞并返回 `liked: false`

#### Scenario: Like new entry
- **GIVEN** 当前用户未点赞该 entry
- **WHEN** 调用 `like_toggle`
- **THEN** 新增点赞并返回 `liked: true`

## Data Contracts
### Input
- `entryId: string`

### Output
- Success: `{ ok: true, liked: boolean }`
- Errors: `NO_REL | MISSING_ID | NOT_FOUND | FORBIDDEN`
