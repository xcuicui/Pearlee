# Spec: fn-entry_create (v1.3)

## Purpose
定义创建记录（Entry）的校验与落库行为：文本 + 图片（最多 3）+ date（YYYY-MM-DD）字段写入，并在写入后更新连续系统（RelationshipStats）。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。

## Requirements
### Requirement: Relationship Required
函数 MUST 要求调用者存在未封存关系。

#### Scenario: No relationship
- **GIVEN** OPENID 无关系
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `NO_REL`

### Requirement: Content Validation
函数 MUST 支持“轻量记录”：允许纯图片，但不允许全空。

#### Scenario: Empty content blocked
- **GIVEN** `text` 为空且 `images` 为空
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `EMPTY`

#### Scenario: Text too long
- **GIVEN** `text.length > 500`
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_LONG`

### Requirement: Images Limit
函数 MUST 限制图片数量最多 3。

#### Scenario: Too many images
- **GIVEN** `images.length > 3`
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_MANY_IMAGES`

### Requirement: Persist Entry
函数 MUST 写入 entry，并补齐 createdAt/updatedAt/date/isDeleted 等字段。

#### Scenario: Create success
- **GIVEN** 文本有效或图片非空，且关系存在
- **WHEN** 调用 `entry_create({ text?, images? })`
- **THEN** 新增记录并返回 entry id
- **AND** entry MUST 写入 `date`（YYYY-MM-DD）作为索引字段

### Requirement: Update RelationshipStats (streak)
函数 SHOULD 在写入成功后更新关系连续系统（RelationshipStats）。

#### Scenario: Update streak after create
- **GIVEN** entry_create 写入成功
- **WHEN** 更新 stats
- **THEN** RelationshipStats.current_streak 与 last_record_date 被更新

## Data Contracts
### Input
- `text?: string`（清洗后 0-500）
- `images?: Array<{ url: string, width: number, height: number }>`（0-3）

### Output
- Success: `{ ok: true, id: string }`
- Errors: `NO_REL | EMPTY | TOO_LONG | TOO_MANY_IMAGES`
