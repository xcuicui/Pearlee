## ADDED Requirements

### Requirement: Create tag type
云函数 `date_tag_type_create` MUST 在当前关系下创建一个新的 tag 类型。

#### Scenario: Create returns id
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `date_tag_type_create({ name })`
- **THEN** 返回 `{ ok: true, id: string }`
