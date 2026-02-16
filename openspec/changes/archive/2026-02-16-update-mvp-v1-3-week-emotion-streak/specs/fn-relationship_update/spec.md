## ADDED Requirements
### Requirement: Update nickname in relationship
函数 MUST 支持更新关系内昵称。

#### Scenario: Save nickname
- **GIVEN** nickname 非空
- **WHEN** 调用 `relationship_update({ nickname })`
- **THEN** 更新当前用户的 relationship member nickname
