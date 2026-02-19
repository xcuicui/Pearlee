## ADDED Requirements

### Requirement: Get user reward assets
函数 MUST 返回当前用户在当前关系内的资产：贝壳余额、抽奖券余额、小心愿券统计。

#### Scenario: Relationship exists
- **GIVEN** OPENID 属于未封存关系
- **WHEN** 调用 `assets_get()`
- **THEN** 返回 `{ ok: true, relationshipId, assets }`
- **AND** `assets` 包含：`points_balance`（贝壳）、`ticket_balance`（抽奖券）、`coupon_counts`（例如 `{ unused, used }`）

#### Scenario: Relationship missing
- **GIVEN** OPENID 不在任何未封存关系中
- **WHEN** 调用 `assets_get()`
- **THEN** 返回错误（NO_REL）
