## ADDED Requirements
### Requirement: Ensure Member Doc On Join
加入关系时 MUST 确保当前用户在 relationship_members 中有记录。

#### Scenario: Join creates member doc
- **GIVEN** 用户通过 inviteCode 加入关系
- **WHEN** 调用 `relationship_join`
- **THEN** relationship.memberOpenids 包含当前 OPENID
- **AND** upsert relationship_members(relationship_id, user_openid)
- **AND** nickname_in_relationship 初始为 NULL
