# Spec: fn-comment_add

## Purpose
定义为某条 entry 新增一条评论（支持同一 entry 多条评论）。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。

## Requirements
### Requirement: Validation
函数 MUST 校验关系存在、entryId 存在、content 非空且长度不超过 200。

#### Scenario: Empty content
- **GIVEN** content 为空
- **WHEN** 调用 `comment_add`
- **THEN** 返回业务错误 `COMMENT_EMPTY`

#### Scenario: Content too long
- **GIVEN** content 超过 200 字
- **WHEN** 调用 `comment_add`
- **THEN** 返回业务错误 `COMMENT_TOO_LONG`

### Requirement: Entry Scope Check
函数 MUST 校验 entry 存在且属于当前关系。

#### Scenario: Entry not found
- **GIVEN** entry 不存在或已删除
- **WHEN** 调用 `comment_add`
- **THEN** 返回业务错误 `ENTRY_NOT_FOUND`

#### Scenario: Entry not in relationship
- **GIVEN** entry 属于其他关系
- **WHEN** 调用 `comment_add`
- **THEN** 返回业务错误 `FORBIDDEN`

### Requirement: Multi Comment Allowed
函数 MUST 允许同一 entry 下多次新增评论（不抛 ALREADY_COMMENTED）。

#### Scenario: Add multiple comments
- **GIVEN** 同一 entry 已存在 comments
- **WHEN** 再次调用 `comment_add`
- **THEN** 仍然成功新增并返回 comment

## Data Contracts
### Input
- `entryId: string`
- `content: string`（清洗后 1-200）

### Output
- Success: `{ ok: true, comment: { id: string, entryId: string, userOpenid: string, authorNickname: string, content: string, createdAt: number, isMine: boolean } }`
- Errors: `NO_REL | MISSING_ID | COMMENT_EMPTY | COMMENT_TOO_LONG | ENTRY_NOT_FOUND | FORBIDDEN`
