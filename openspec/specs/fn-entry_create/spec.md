# Spec: fn-entry_create

## Purpose
定义创建日记记录的校验与落库行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Relationship Required
函数 MUST 要求调用者存在未封存关系。

#### Scenario: No relationship
- **GIVEN** OPENID 无关系
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `NO_REL`

### Requirement: Text Validation
函数 MUST 支持轻量记录：允许纯图片，但不允许全空。

#### Scenario: Empty content blocked
- **GIVEN** text 为空且 images 为空
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `EMPTY`

### Requirement: Persist Entry
函数 MUST 写入 entry，并补齐 dayKey/时间戳/默认字段。

#### Scenario: Create success
- **GIVEN** 文本有效且关系存在
- **WHEN** 调用 `entry_create({ text })`
- **THEN** 新增记录并返回 entry id

### Requirement: Images Limit 3
函数 MUST 限制图片最多 3。

#### Scenario: Too many images
- **GIVEN** images.length > 3
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_MANY_IMAGES`

### Requirement: Persist date field
函数 MUST 写入 `date`（YYYY-MM-DD）用于周历查询。

#### Scenario: Date set
- **WHEN** 创建成功
- **THEN** entry.date 为创建当天 YYYY-MM-DD

### Requirement: Update RelationshipStats
函数 MUST 在写入后更新 RelationshipStats（current_streak/last_record_date）。

#### Scenario: Stats updated
- **WHEN** 创建成功
- **THEN** stats.updated_at 被刷新

## Data Contracts
### Input
- `text: string`（清洗后 1-500）

### Output
- Success: `{ ok: true, id: string }`
- Errors: `NO_REL | EMPTY | TOO_LONG`
