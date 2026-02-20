## ADDED Requirements

### Requirement: List tag types with defaults
云函数 `date_tag_type_list` MUST 返回当前关系下可用的 tag 类型列表；首次使用时 MUST 至少包含默认类型：地点、氛围。

#### Scenario: Default types exist
- **GIVEN** 当前关系首次使用标签功能
- **WHEN** 调用 `date_tag_type_list()`
- **THEN** 返回 `{ ok: true, items: Array<TagTypeView> }`
- **AND** items 中包含 name 为“地点”和“氛围”的类型
