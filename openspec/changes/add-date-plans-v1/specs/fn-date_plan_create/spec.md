## ADDED Requirements

### Requirement: Create date plan
云函数 `date_plan_create` MUST 创建一条约会清单项，并绑定到当前用户所在关系。

#### Scenario: Create returns id
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `date_plan_create({ title, notes? })`
- **THEN** 返回 `{ ok: true, id: string }`
