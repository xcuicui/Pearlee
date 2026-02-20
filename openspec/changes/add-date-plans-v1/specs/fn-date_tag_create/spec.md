## ADDED Requirements

### Requirement: Create tag
云函数 `date_tag_create` MUST 在当前关系下某个 tag 类型中创建一个新的 tag。

#### Scenario: Create returns id
- **GIVEN** typeId 属于当前关系
- **WHEN** 调用 `date_tag_create({ typeId, name })`
- **THEN** 返回 `{ ok: true, id: string }`

#### Scenario: Duplicate name in type rejected
- **GIVEN** 同一个 typeId 下已存在同名 tag
- **WHEN** 调用 `date_tag_create({ typeId, name })`
- **THEN** 返回 `{ ok: false, error: 'duplicate_tag' }`（或等价错误）
