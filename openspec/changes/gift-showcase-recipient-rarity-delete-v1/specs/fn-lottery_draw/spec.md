## MODIFIED Requirements

### Requirement: Draw from recipient-filtered gift pool with rarity weights
云函数 `lottery_draw` MUST 仅从“送给当前用户”的礼物池中抽取礼物，并根据稀有度进行加权随机。

#### Pool filter
- 云函数 MUST 仅选择满足以下条件的 GiftDefinition 作为抽取池：
  - `space_id = current relationshipId`
  - `recipient_user_id = currentUser`
  - `is_active = true`
  - `is_deleted = false`

#### Rarity weight mapping (backend-only)
- 云函数 MUST 使用固定映射计算权重：
  - `common` -> 15
  - `occasional` -> 8
  - `rare` -> 3
- 云函数 MUST NOT 接受前端传入权重。

#### Result instance
- 云函数 MUST 在成功抽取后创建 1 条 RewardInstance，并写入 snapshot：
  - `gift_id`
  - `recipient_user_id`
  - `gift_title_snapshot`
  - `gift_desc_snapshot`
  - `rarity_snapshot`
  - `created_at`

#### Points cost
- 云函数 MUST 扣减 1 枚贝壳（points_balance -1），并保持审计 ledger 写入。

#### Scenario: Draw only from gifts for me
- **GIVEN** gift_definitions 中存在 A（recipient=me）与 B（recipient=partner）
- **WHEN** 我调用 `lottery_draw({count:1})`
- **THEN** 抽取结果 MUST 仅可能来自 A 的池，而不可能来自 B

#### Scenario: Empty pool
- **GIVEN** 满足条件的 gift_definitions 为空
- **WHEN** 我调用 `lottery_draw({count:1})`
- **THEN** 云函数返回错误 code `POOL_EMPTY`
- **AND** 错误信息为温柔提示（用于前端展示空态）
