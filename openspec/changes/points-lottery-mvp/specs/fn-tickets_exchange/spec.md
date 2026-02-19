## ADDED Requirements

### Requirement: Exchange shells for tickets
函数 MUST 支持贝壳兑换抽奖券：固定比例 `10 贝壳 -> 1 抽奖券`，且余额不足 MUST 失败。

#### Scenario: Exchange success
- **GIVEN** `points_balance >= 10` 且请求兑换 `count=1`
- **WHEN** 调用 `tickets_exchange({ count: 1 })`
- **THEN** 扣减 `points_balance -= 10` 且增加 `ticket_balance += 1`
- **AND** 返回 `{ ok: true, points_balance, ticket_balance }`

#### Scenario: Insufficient shells
- **GIVEN** `points_balance < 10`
- **WHEN** 调用 `tickets_exchange({ count: 1 })`
- **THEN** 返回错误（INSUFFICIENT_POINTS）且余额不变化
