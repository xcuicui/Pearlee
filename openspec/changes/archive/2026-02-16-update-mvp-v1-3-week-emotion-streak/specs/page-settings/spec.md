## ADDED Requirements
### Requirement: Update relationship nickname
页面 MUST 支持修改关系内昵称。

#### Scenario: Save nickname
- **WHEN** 用户保存昵称
- **THEN** 调用 `relationship_update({ nickname })` 并提示成功
