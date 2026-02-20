## ADDED Requirements

### Requirement: Delete tag
云函数 `date_tag_delete` MUST 删除当前关系下的指定 tag。

#### Scenario: Delete success
- **GIVEN** tagId 属于当前关系
- **WHEN** 调用 `date_tag_delete({ tagId })`
- **THEN** 返回 `{ ok: true }`

#### Scenario: Tag in use handled
- **GIVEN** tagId 被某些清单项引用
- **WHEN** 调用 `date_tag_delete({ tagId })`
- **THEN** 系统 MUST 采用一种一致策略：
  - A) 级联移除：从所有清单项的 tagIds 中移除该 tagId 后再删除 tag
  - OR
  - B) 拒绝删除：返回 `{ ok: false, error: 'tag_in_use' }`
