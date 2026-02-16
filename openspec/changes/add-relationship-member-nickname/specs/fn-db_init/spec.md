## ADDED Requirements
### Requirement: Relationship Members Collection
数据库初始化 MUST 确保存在 `relationship_members` 集合及必要索引。

#### Scenario: Ensure collection and index
- **WHEN** 调用 `db_init`
- **THEN** `relationship_members` 集合存在
- **AND** 存在索引 `relationshipId + userOpenid`（用于唯一性/快速查询）

### Requirement: Idempotent Member Backfill
db_init（或其迁移阶段）MUST 为历史 relationships 回填 relationship_members 记录且幂等。

#### Scenario: Backfill missing member docs
- **GIVEN** relationships 中存在 memberOpenids
- **AND** 对应 relationship_members 缺失
- **WHEN** 执行回填
- **THEN** 为每个 (relationship, memberOpenid) 创建 member 记录
- **AND** nickname_in_relationship 为 NULL

#### Scenario: Backfill is idempotent
- **GIVEN** 已执行过回填
- **WHEN** 再次执行回填
- **THEN** 不产生重复 member 记录
