# Spec: fn-env_check

## Purpose
定义运行时环境健康检查能力（集合存在性）。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Required Collections Check
函数 MUST 检查 `users/relationships/entries/likes/comments` 是否可访问。

#### Scenario: All collections present
- **GIVEN** 所有必需集合存在
- **WHEN** 调用 `env_check`
- **THEN** 返回 `ok: true` 且 `missingCollections` 为空

#### Scenario: Missing collections
- **GIVEN** 存在缺失集合
- **WHEN** 调用 `env_check`
- **THEN** 返回 `ok: false` 与缺失集合列表

## Data Contracts
### Input
- `event`: 无必填字段

### Output
- `{ ok: boolean, missingCollections: string[], checks: Array<{ name: string, exists: boolean, reason?: string, checkFailed?: boolean }> }`
