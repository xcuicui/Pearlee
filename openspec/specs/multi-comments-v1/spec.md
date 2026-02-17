# Spec: multi-comments-v1

## Purpose
将贝忆 Pearlee 的评论能力从「每条 Entry 仅 1 条回应」升级为「每条 Entry 支持多条评论（无层级）」；并提供可验收的云函数契约、权限校验、迁移策略与前端交互要求。

本规格是唯一真理源；任何实现变更必须先更新本 spec。

## Requirements

### Requirement: Multiple comments per entry
系统 MUST 允许同一 `entryId` 下存在多条 comment（包括同一用户也可多条），且不得出现“后发覆盖前发”。

#### Scenario: Add multiple comments (same entry)
- **GIVEN** 用户属于未封存关系，且 entry 属于该关系
- **WHEN** 连续调用 `comment_add({ entryId, content })` 两次
- **THEN** 两次都成功返回 comment
- **AND** `comment_list(entryId)` 能返回两条不同的 comment（不同 id）

### Requirement: Comment ordering
评论列表 MUST 按 `createdAt` **升序**排序（从早到晚）。

#### Scenario: List ordering is stable
- **GIVEN** 同一 entry 有多条 comment
- **WHEN** 调用 `comment_list({ entryId })`
- **THEN** 返回 comments 按 createdAt asc
- **AND** createdAt 相同时使用 `_id` 作为稳定 tie-break（asc）

### Requirement: Pagination (limit + cursor)
评论列表 MUST 支持分页：`limit + cursor`，并返回 `nextCursor`（无更多为 null）。

#### Scenario: First page + next page
- **GIVEN** entry 下存在超过 limit 的 comments
- **WHEN** 调用 `comment_list({ entryId, limit: 20 })`
- **THEN** 返回 `comments.length <= 20`
- **AND** 返回 `nextCursor` 非空
- **WHEN** 使用该 `nextCursor` 调用下一页
- **THEN** 不返回重复 comment
- **AND** 合并两页后仍满足排序要求

### Requirement: Delete own comment only
系统 MUST 只允许评论作者删除自己的评论，不允许删除对方评论。

#### Scenario: Author can delete
- **GIVEN** 用户 A 创建了一条 comment
- **WHEN** A 调用 `comment_delete({ commentId })`
- **THEN** 成功 `{ ok: true }`
- **AND** 后续 `comment_list` 不再返回该 comment

#### Scenario: Non-author forbidden
- **GIVEN** 用户 A 创建了一条 comment
- **WHEN** 用户 B（同关系但非作者）调用 `comment_delete({ commentId })`
- **THEN** 返回业务错误 `FORBIDDEN`

### Requirement: Relationship & entry scope authorization
所有评论读写删 MUST 校验关系存在、entry/comment 属于当前关系。

#### Scenario: Not in relationship
- **GIVEN** 用户不属于任何未封存关系
- **WHEN** 调用 `comment_list/comment_add/comment_delete`
- **THEN** 返回业务错误 `NO_REL`

#### Scenario: Entry not in relationship
- **GIVEN** entry 属于其他 relationship
- **WHEN** 调用 `comment_add/comment_list`
- **THEN** 返回业务错误 `FORBIDDEN`

### Requirement: Client UX on day detail page
日详情页 MUST 支持多评论展示与交互：列表、发送、加载更多、删除。

#### Scenario: Day detail shows comment list and composer
- **GIVEN** 日详情页展示一条 entry
- **WHEN** entry 下有 comments
- **THEN** 页面展示评论列表（多条）
- **AND** 展示输入框与发送按钮

#### Scenario: Send comment UI behavior
- **WHEN** 用户发送成功
- **THEN** 输入框清空
- **AND** 新 comment 出现在列表末尾（因 asc 排序）

#### Scenario: Empty content UI error
- **GIVEN** 输入内容为空
- **WHEN** 点击发送
- **THEN** toast 提示“写点什么再发送”

---

## Background (scan evidence)
- `cloudfunctions/comment_set/index.js` 通过查询 `comments.where({ entryId }).limit(1)` 并抛 `ALREADY_COMMENTED` 实现单条限制。
- `cloudfunctions/day_entries/index.js` 将 comments 聚合成单条 `comment`（如果存在多条只保留 latest）。
- 前端 `miniprogram/pages/day/detail.wxml` 只渲染 `item.comment` 单对象，并在无 comment 时才显示输入框。

## Non-Goals
- 不做线程/回复层级/楼中楼
- 不做@、表情贴纸、富文本
- 不做评论编辑
- 不做通知/未读系统

## Data Model
comments collection:
- `_id: string`
- `entryId: string`
- `relationshipId: string`（冗余，用于权限校验/查询）
- `userOpenid: string`
- `content: string`
- `createdAt: number`（ms）

Deletion: 本版本采用硬删除（remove）。

Indexes:
- 新增 `idx_entryId_createdAt_asc`: `{ entryId: 1, createdAt: 1 }`
- 保留旧 `idx_entryId_createdAt`（如存在）不强删，避免环境不支持 drop。

## API Contracts (Cloud Functions)
### comment_list
Input:
- `entryId: string`
- `limit?: number` default 20, max 50
- `cursor?: string`

Output:
- `{ ok: true, comments: CommentItem[], nextCursor: string | null }`

### comment_add
Input:
- `entryId: string`
- `content: string` trim 后 1..200

Output:
- `{ ok: true, comment: CommentItem }`

Errors:
- 空：`COMMENT_EMPTY`
- 超长：`COMMENT_TOO_LONG`
- entry 不存在：`ENTRY_NOT_FOUND`

### comment_delete
Input:
- `commentId: string`

Output:
- `{ ok: true }`

Errors:
- 不存在：`COMMENT_NOT_FOUND`

### CommentItem shape
- `id: string`
- `entryId: string`
- `userOpenid: string`
- `authorNickname: string`
- `content: string`
- `createdAt: number`
- `isMine: boolean`

## Error Codes
规范化业务错误码（云函数返回 BizError.code）：
- `NO_REL`
- `MISSING_ID`
- `COMMENT_EMPTY`
- `COMMENT_TOO_LONG`
- `ENTRY_NOT_FOUND`
- `COMMENT_NOT_FOUND`
- `FORBIDDEN`

> 兼容：旧 code 里使用 `EMPTY | TOO_LONG | NOT_FOUND` 等；实现时应统一到上述 code，或在 spec 中写清映射（本版本要求统一）。

## Migration / Compatibility
- 移除单条限制：
  - `comment_set` 不再用于写入（保留一段兼容期或直接改为调用 `comment_add`）
  - `day_entries` 不再 collapse 为单条 comment；改为返回 `commentCount`（可选）且日详情通过 `comment_list` 拉取详情
- `db_init` 追加 comments 索引 `idx_entryId_createdAt_asc`。

## Test Plan
Backend:
- 同 entry 多条 comment（同一 user 也可多条）
- 权限：非关系成员不可读写删；非作者不可删
- 分页：cursor/limit 正常、无重复、顺序稳定

Frontend:
- 发送多条正常展示
- 删除自己的评论正常
- 加载更多正常

## Acceptance Criteria
- 同一 Entry 支持多条评论，不覆盖
- createdAt asc 顺序稳定
- 支持分页加载更多
- 只允许删自己的评论
- 日详情页 UI/交互符合要求，整体克制
