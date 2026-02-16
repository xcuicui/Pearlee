## ADDED Requirements
### Requirement: Update My Relationship Nickname
关系更新 MUST 支持更新“我在这段关系里的名字”，写入 relationship_members。

#### Scenario: Update nickname success
- **GIVEN** OPENID 属于未封存关系
- **AND** nickname 非空、trim 后 1-10 字
- **WHEN** 调用 `relationship_update({ nickname })`
- **THEN** 更新 relationship_members.nickname_in_relationship

#### Scenario: Invalid nickname rejected
- **GIVEN** nickname 为空或超过 10 字或包含 emoji/非法字符
- **WHEN** 调用 `relationship_update({ nickname })`
- **THEN** 返回业务错误 `NICKNAME_EMPTY | NICKNAME_TOO_LONG | NICKNAME_INVALID_CHAR`
