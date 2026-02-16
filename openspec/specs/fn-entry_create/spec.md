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
函数 MUST 清洗文本并限制长度。

#### Scenario: Empty text
- **GIVEN** 文本为空
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `EMPTY`

#### Scenario: Text too long
- **GIVEN** 文本长度超过 500
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_LONG`

### Requirement: Persist Entry
函数 MUST 写入 entry，并补齐 dayKey/时间戳/默认字段。

#### Scenario: Create success
- **GIVEN** 文本有效且关系存在
- **WHEN** 调用 `entry_create({ text })`
- **THEN** 新增记录并返回 entry id

## Data Contracts
### Input
- `text: string`（清洗后 1-500）

### Output
- Success: `{ ok: true, id: string }`
- Errors: `NO_REL | EMPTY | TOO_LONG`
