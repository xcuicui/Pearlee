## ADDED Requirements
### Requirement: Create Member Nickname
创建关系时 MUST 记录创建者在关系中的昵称（写入 relationship_members），且不写入占位符。

#### Scenario: Create with nickname
- **GIVEN** 用户输入 nickname（1-10 字，trim，禁 emoji）
- **WHEN** 调用 `relationship_create({ nickname })`
- **THEN** 创建 relationship
- **AND** upsert relationship_members(relationship_id, user_openid) 并写入 nickname_in_relationship
