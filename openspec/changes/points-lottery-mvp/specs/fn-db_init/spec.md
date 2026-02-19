## MODIFIED Requirements

### Requirement: Ensure Required Collections
函数 MUST 覆盖必需集合的存在性检查与创建尝试，并输出可审计报告。

必需集合 MUST 包含：
- 既有：`users/relationships/relationship_members/entries/likes/comments/relationship_stats`
- 新增：`user_assets/point_ledger/coupons`

#### Scenario: New reward collections missing
- **GIVEN** `user_assets`/`point_ledger`/`coupons` 任意集合不存在
- **WHEN** 调用 `db_init`
- **THEN** 函数尝试通过 `createCollection` 或 dummy 写入策略创建集合并记录结果

### Requirement: Ensure Required Indexes
函数 MUST 对已可用集合创建约定索引，并对不可创建场景给出状态。

新增索引 MUST 包含（最小）：
- `user_assets.idx_relationshipId_userOpenid`：`{ relationshipId: 1, userOpenid: 1 }`（unique）
- `point_ledger.idx_relationshipId_userOpenid_type_refId`：`{ relationshipId: 1, userOpenid: 1, type: 1, ref_id: 1 }`（unique，用于幂等）
- `coupons.idx_relationshipId_userOpenid_obtainedAt`：`{ relationshipId: 1, userOpenid: 1, obtained_at: -1 }`

#### Scenario: Index exists already
- **GIVEN** 索引已存在
- **WHEN** 调用 `db_init`
- **THEN** 返回该索引 `ok: true` 且标记为已存在
