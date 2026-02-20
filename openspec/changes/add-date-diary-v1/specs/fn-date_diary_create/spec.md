## ADDED Requirements

### Requirement: Create date diary
云函数 `date_diary_create` MUST 创建一条约会日记（图文 + occurAt），并可选关联到某条清单项。

#### Scenario: Create with planId
- **GIVEN** planId 属于当前关系
- **WHEN** 调用 `date_diary_create({ planId, occurAt, text, images })`
- **THEN** 返回 `{ ok: true, id: string }`

#### Scenario: Create temporary diary
- **WHEN** 调用 `date_diary_create({ planId: '', occurAt, text, images })`
- **THEN** 返回 `{ ok: true, id: string }`
