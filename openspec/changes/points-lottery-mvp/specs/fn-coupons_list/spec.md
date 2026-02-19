## ADDED Requirements

### Requirement: List coupon wallet
函数 MUST 返回当前用户的小心愿券列表，包含未使用与已使用状态。

#### Scenario: List coupons
- **WHEN** 调用 `coupons_list()`
- **THEN** 返回 `{ ok: true, coupons }`
- **AND** `coupons[]` 每项包含：`id/title/desc/status/obtained_at/used_at?`
