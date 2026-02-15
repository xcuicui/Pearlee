## MODIFIED Requirements
### Requirement: Text Validation
函数 MUST 清洗文本并限制长度；同时校验图片数组数量上限。

#### Scenario: Empty text
- **GIVEN** 文本为空
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `EMPTY`

#### Scenario: Text too long
- **GIVEN** 文本长度超过 500
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_LONG`

#### Scenario: Too many images
- **GIVEN** `images` 数组长度超过 9
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_MANY_IMAGES`

### Requirement: Persist Entry
函数 MUST 写入 entry，并补齐 dayKey/时间戳/默认字段。

#### Scenario: Create success
- **GIVEN** 文本有效且关系存在
- **WHEN** 调用 `entry_create({ text, images })`
- **THEN** 新增记录并返回 entry id
- **AND** 记录包含 `images` 字段（数组，默认空数组）

## ADDED Requirements
### Requirement: Images Payload Compatibility
函数 MUST 接受可选 `images` 字段并保持向后兼容。

#### Scenario: Missing images defaults to empty
- **GIVEN** 调用方未传 `images`
- **WHEN** 创建记录
- **THEN** 按空数组处理并成功落库
