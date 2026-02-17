# Spec: fn-comment_list

## Purpose
定义按 `entryId` 分页拉取评论列表的能力，并明确排序、cursor 分页（limit+cursor）、权限校验与返回结构，供日详情页多评论展示使用。

## Requirements
### Requirement: Authorization
函数 MUST 校验关系存在，且 entry 属于当前关系。

#### Scenario: No relationship
- **GIVEN** OPENID 无关系
- **WHEN** 调用 `comment_list`
- **THEN** 返回业务错误 `NO_REL`

#### Scenario: Entry not in relationship
- **GIVEN** entry 属于其他关系
- **WHEN** 调用 `comment_list`
- **THEN** 返回业务错误 `FORBIDDEN`

### Requirement: List ordering
函数 MUST 按 `createdAt` 升序 + `_id` 升序排序返回。

#### Scenario: Ordering
- **WHEN** 调用 `comment_list({ entryId })`
- **THEN** comments 按 createdAt asc
- **AND** createdAt 相同按 id asc

### Requirement: Pagination
函数 MUST 支持 `limit + cursor`，并返回 `nextCursor`。

#### Scenario: Next cursor
- **GIVEN** comments 数量大于 limit
- **WHEN** 调用 `comment_list({ entryId, limit })`
- **THEN** 返回 `nextCursor` 非空
- **WHEN** 使用 nextCursor 再调一次
- **THEN** 不返回重复项

## Data Contracts
### Input
- `entryId: string`
- `limit?: number`（default 20, max 50）
- `cursor?: string`

### Output
- Success: `{ ok: true, comments: Array<CommentItem>, nextCursor: string | null }`
- CommentItem: `{ id, entryId, userOpenid, authorNickname, content, createdAt, isMine }`
- Errors: `NO_REL | MISSING_ID | ENTRY_NOT_FOUND | FORBIDDEN`
