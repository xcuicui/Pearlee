# Spec: fn-comment_set

## Purpose
定义对 entry 设置回应的能力（MVP 每条记录仅 1 条回应）。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Validation
函数 MUST 校验关系存在、entryId 存在、content 非空且长度不超过 120。

#### Scenario: Empty content
- **GIVEN** content 为空
- **WHEN** 调用 `comment_set`
- **THEN** 返回业务错误 `EMPTY`

#### Scenario: Content too long
- **GIVEN** content 超过 120 字
- **WHEN** 调用 `comment_set`
- **THEN** 返回业务错误 `TOO_LONG`

### Requirement: Entry Scope Check
函数 MUST 校验 entry 存在且属于当前关系。

#### Scenario: Entry not in relationship
- **GIVEN** entry 属于其他关系
- **WHEN** 调用 `comment_set`
- **THEN** 返回业务错误 `FORBIDDEN`

### Requirement: Single Comment Constraint
函数 MUST 保证每条 entry 最多 1 条 comment。

#### Scenario: Comment already exists
- **GIVEN** entry 已有 comment
- **WHEN** 调用 `comment_set`
- **THEN** 返回业务错误 `ALREADY_COMMENTED`

#### Scenario: First comment success
- **GIVEN** entry 尚无 comment
- **WHEN** 调用 `comment_set({ entryId, content })`
- **THEN** 新增 comment 并返回新 id

## Data Contracts
### Input
- `entryId: string`
- `content: string`（清洗后 1-120）

### Output
- Success: `{ ok: true, id: string }`
- Errors: `NO_REL | MISSING_ID | EMPTY | TOO_LONG | NOT_FOUND | FORBIDDEN | ALREADY_COMMENTED`
