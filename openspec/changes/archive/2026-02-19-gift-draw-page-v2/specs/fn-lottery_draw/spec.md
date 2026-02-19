## MODIFIED Requirements

### Requirement: Draw consumes 1 point and creates one coupon
云函数 `lottery_draw` MUST 在一次抽奖中消耗 1 枚贝壳（points_balance），并生成 1 张礼物券（coupon）。

#### Scenario: Successful draw
- **GIVEN** `points_balance >= 1`
- **WHEN** 调用 `lottery_draw({ count: 1 })`
- **THEN** 服务端创建 coupon（status=unused）
- **AND** 写入 ledger：`delta_points = -1`（或等价扣减记录）
- **AND** `user_assets.points_balance` 扣减 1
- **AND** 返回 `coupon`（包含 title/desc/obtained_at/prize_key）

### Requirement: Weighted random stays server-side and pure
抽奖 MUST 由服务端执行加权随机，且随机算法必须以纯函数形式存在：`drawPrize(pool, r)`。

#### Scenario: Weighted random algorithm
- **GIVEN** 奖池包含 `weight` 且 totalWeight = sum(weights)
- **WHEN** 服务端生成 `r` 满足 `0 <= r < totalWeight`
- **THEN** `drawPrize(pool, r)` 返回命中的 prize

#### Scenario: No UI random
- **WHEN** 用户触发抽奖
- **THEN** 前端不使用 `Math.random()` 决定奖品
