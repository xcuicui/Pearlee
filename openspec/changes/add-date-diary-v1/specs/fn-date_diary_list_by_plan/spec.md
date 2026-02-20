## ADDED Requirements

### Requirement: List diaries by plan
云函数 `date_diary_list_by_plan` MUST 返回指定清单项关联的约会日记列表，按 occurAt 倒序或正序需保持一致（客户端可按 spec 约定渲染）。

#### Scenario: List returns items
- **GIVEN** planId 属于当前关系
- **WHEN** 调用 `date_diary_list_by_plan({ planId, limit? })`
- **THEN** 返回 `{ ok: true, items: Array<DateDiaryView> }`
- **AND** 每条包含 `id, planId, text, images, occurAt, createdAt`
