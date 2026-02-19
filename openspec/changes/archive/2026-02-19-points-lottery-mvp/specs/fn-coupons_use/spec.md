## ADDED Requirements

### Requirement: Mark coupon as used
函数 MUST 支持将指定小心愿券标记为已使用，且不得跨用户操作。

#### Scenario: Mark used success
- **GIVEN** coupon 属于当前用户且 `status=unused`
- **WHEN** 调用 `coupons_use({ id })`
- **THEN** 更新 coupon `status=used` 且写入 `used_at`
- **AND** 返回 `{ ok: true, coupon }`

#### Scenario: Already used
- **GIVEN** coupon `status=used`
- **WHEN** 调用 `coupons_use({ id })`
- **THEN** 返回 `{ ok: true, coupon }`（幂等）
