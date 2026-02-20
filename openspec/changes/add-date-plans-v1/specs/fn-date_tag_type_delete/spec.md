## ADDED Requirements

### Requirement: Delete tag type
云函数 `date_tag_type_delete` MUST 删除当前关系下的指定 tag 类型，并以一致策略处理该类型下的 tags。

#### Scenario: Delete type success (cascade)
- **GIVEN** typeId 属于当前关系
- **WHEN** 调用 `date_tag_type_delete({ typeId })`
- **THEN** 系统 MUST 级联删除该类型下所有 tags
- **AND** 系统 MUST 从所有清单项的 tagIds 中移除这些 tags
- **AND** 返回 `{ ok: true, deletedTags: number, updatedPlans: number }`

#### Scenario: Type not found
- **WHEN** 调用 `date_tag_type_delete({ typeId })` 且 typeId 不存在或不属于当前关系
- **THEN** 返回 `{ ok: false, error: 'not_found' }`（或等价错误）
