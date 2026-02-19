## ADDED Requirements

### Requirement: Draw consumes a ticket and issues a coupon
函数 MUST 支持抽奖：每次抽奖消耗 1 张抽奖券，从固定奖池按权重随机 1 个奖项，生成 1 张「小心愿券」并写入券包。

奖池（MVP 固定，至少 6 个）：
- `coffee`：咖啡券，desc=“想你时，给你买一杯咖啡。”，weight=20
- `milk_tea`：奶茶券，desc=“把甜甜的那口，也收纳给你。”，weight=20
- `hangout`：陪逛街券，desc=“一起慢慢走，什么都不急。”，weight=15
- `play`：陪玩券，desc=“陪你玩一局（或你想玩的任何事）。”，weight=15
- `sing`：唱歌券，desc=“给你唱一首歌，唱到你开心。”，weight=10
- `wish`：小愿望满足券，desc=“一个小愿望，我来认真听。”，weight=5
- `hug`：抱抱券，desc=“给你一个抱抱（可随时兑换）。”，weight=15

#### Scenario: Draw success
- **GIVEN** `ticket_balance >= 1`
- **WHEN** 调用 `lottery_draw({ count: 1 })`
- **THEN** 扣减 `ticket_balance -= 1`
- **AND** 依据权重随机选出奖项，创建 coupon 实例（`status=unused`，记录 obtained_at）
- **AND** 返回 `{ ok: true, ticket_balance, coupon }`

#### Scenario: No tickets
- **GIVEN** `ticket_balance = 0`
- **WHEN** 调用 `lottery_draw({ count: 1 })`
- **THEN** 返回错误（INSUFFICIENT_TICKETS）
