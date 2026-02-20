## ADDED Requirements

### Requirement: List tags by type
云函数 `date_tag_list` MUST 返回当前关系下的 tags，并支持按 typeId 筛选。

#### Scenario: List by type
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `date_tag_list({ typeId })`
- **THEN** 返回 `{ ok: true, items: Array<TagView> }`
- **AND** 每条包含 `id,typeId,name,createdAt`

### Requirement: Default tags exist
系统 MUST 提供默认 tags，至少包含：
- 地点：室内、户外
- 氛围：松弛、浪漫、热闹

#### Scenario: Default tags returned
- **GIVEN** 当前关系首次使用标签功能
- **WHEN** 调用 `date_tag_list({})`
- **THEN** 返回 items 中包含上述默认 tags
