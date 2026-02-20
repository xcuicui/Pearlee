## ADDED Requirements

### Requirement: Update date plan tags
云函数 `date_plan_update` MUST 支持更新约会清单项的 tags（覆盖式写入 tagIds）。

#### Scenario: Update tagIds
- **GIVEN** planId 属于当前关系
- **WHEN** 调用 `date_plan_update({ planId, tagIds })`
- **THEN** 返回 `{ ok: true }`
- **AND** 清单项的 tagIds 被更新为传入集合

#### Scenario: Invalid tag rejected
- **GIVEN** tagIds 中包含不属于当前关系的 tag
- **WHEN** 调用 `date_plan_update({ planId, tagIds })`
- **THEN** 返回 `{ ok: false, error: 'invalid_tag' }`（或等价错误）
