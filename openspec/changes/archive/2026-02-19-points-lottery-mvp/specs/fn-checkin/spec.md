## ADDED Requirements

### Requirement: Daily check-in earns shells
函数 MUST 支持「想念打卡」：用户在自然日内最多成功 1 次；首次成功发放 +3 贝壳，并以 date 做幂等。

#### Scenario: First check-in today
- **GIVEN** 用户今天尚未打卡
- **WHEN** 调用 `checkin()`
- **THEN** 服务端判定今天为首次打卡并发放 `earned_points = 3`
- **AND** 更新 `points_balance` 与 `last_checkin_date`
- **AND** 返回 `{ ok: true, earned_points: 3, checked_in: true, date }`

#### Scenario: Repeated check-in today
- **GIVEN** 用户今天已打卡
- **WHEN** 再次调用 `checkin()`
- **THEN** 返回 `{ ok: true, earned_points: 0, checked_in: true, date }`
- **AND** 不重复发放贝壳
