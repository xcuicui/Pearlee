# Spec: fn-comment_delete

## Purpose
定义删除评论的能力，并明确仅作者可删、关系归属校验、错误码与返回结构；本版本采用硬删除（remove），用于日详情页删除自己的评论。

## Requirements
### Requirement: Authorization
函数 MUST 校验关系存在。

#### Scenario: No relationship
- **GIVEN** OPENID 无关系
- **WHEN** 调用 `comment_delete`
- **THEN** 返回业务错误 `NO_REL`

### Requirement: Only author can delete
函数 MUST 仅允许 comment 作者删除自己的评论。

#### Scenario: Not found
- **GIVEN** comment 不存在
- **WHEN** 调用 `comment_delete`
- **THEN** 返回业务错误 `COMMENT_NOT_FOUND`

#### Scenario: Forbidden when not author
- **GIVEN** comment 属于同一关系但作者不是我
- **WHEN** 调用 `comment_delete`
- **THEN** 返回业务错误 `FORBIDDEN`

#### Scenario: Delete success
- **GIVEN** comment 作者是我
- **WHEN** 调用 `comment_delete`
- **THEN** 成功 `{ ok: true }`

## Data Contracts
### Input
- `commentId: string`

### Output
- Success: `{ ok: true }`
- Errors: `NO_REL | MISSING_ID | COMMENT_NOT_FOUND | FORBIDDEN`
