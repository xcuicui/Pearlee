## ADDED Requirements

### Requirement: Create date plan
云函数 `date_plan_create` MUST 创建一条约会清单项，并绑定到当前用户所在关系；并支持保存该清单项的 tags。

#### Scenario: Create returns id
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `date_plan_create({ title, notes?, tagIds? })`
- **THEN** 返回 `{ ok: true, id: string }`

#### Scenario: Unknown tag id rejected
- **GIVEN** 用户提交的 tagIds 中包含不属于当前关系的 tag
- **WHEN** 调用 `date_plan_create({ ..., tagIds })`
- **THEN** 返回 `{ ok: false, error: 'invalid_tag' }`（或等价错误）
