## ADDED Requirements

### Requirement: Coupon wallet list
页面 MUST 展示当前用户的小心愿券列表，并区分未使用/已使用状态。

#### Scenario: List coupons
- **WHEN** 进入券包页
- **THEN** 页面调用 `coupons_list()`
- **AND** 列表展示每张券的名称、描述与获得时间
- **AND** 未使用券展示操作「标记为已使用」

### Requirement: Mark used with confirmation
页面 MUST 在用户操作核销时二次确认，并在成功后更新列表状态。

#### Scenario: Confirm then mark used
- **GIVEN** 用户点击某张未使用券的「标记为已使用」
- **WHEN** 用户在确认弹窗中确认
- **THEN** 页面调用 `coupons_use({ id })`
- **AND** 成功后该券状态更新为已使用
