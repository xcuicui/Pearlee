## MODIFIED Requirements

### Requirement: Server-side weighted random uses pure function
云函数 `lottery_draw` MUST 使用加权随机算法，并以纯函数形式实现：`drawPrize(pool, r): Prize`。

#### Scenario: Weighted random algorithm
- **GIVEN** 奖池 `pool = [{ key, weight }, ...]` 且 weight > 0
- **WHEN** 服务端生成 `r` 满足 `0 <= r < totalWeight`
- **THEN** `drawPrize(pool, r)` 返回命中的 Prize
- **AND** totalWeight = sum(weights)
- **AND** 遍历累加区间匹配

#### Scenario: No UI random
- **WHEN** 用户触发抽奖
- **THEN** 随机 MUST 在服务端执行
- **AND** 前端不使用 `Math.random()` 决定奖品

### Requirement: One draw consumes one ticket and creates one coupon
云函数 MUST 在一次抽奖中消耗 1 张小礼物券，并生成 1 张小心愿券实例（coupon）。

#### Scenario: Successful draw
- **GIVEN** 用户 `ticket_balance >= 1`
- **WHEN** 调用 `lottery_draw({ count: 1 })`
- **THEN** 服务端扣减 `ticket_balance - 1`
- **AND** 写入一条 `point_ledger(type=lottery, delta_tickets=-1)`
- **AND** 创建一条 `coupons(status=unused)`
- **AND** 返回 `coupon` 与最新 `ticket_balance`
