## MODIFIED Requirements

### Requirement: Coupon wallet list is folded by type
券包页 MUST 将同一种券按券类型折叠展示。

- 分组 key MUST 为 `title + desc`（两者 trim 后拼接）。
- 页面 MUST 在列表中展示分组后的券卡片，而不是每张券一条。
- 当同组券数量大于 1 时，页面 MUST 在标题旁展示数量标识 `×N`。
- 分组状态 MUST 满足：
  - 若该组存在至少 1 张未使用券，则该组状态为“未使用”；
  - 否则状态为“已使用”。
- 分组时间 MUST 展示该组内最新获得时间（最大 `obtained_at`）。

#### Scenario: List grouped coupons
- **WHEN** 用户进入券包页
- **THEN** 页面调用 `coupons_list()` 获取券列表
- **AND** 页面按 `title + desc` 对券进行分组并折叠展示
- **AND** 同组券在标题旁展示 `×N` 数量（当 N>1）

### Requirement: Mark used consumes one coupon instance
当用户在折叠分组卡片上进行核销时，页面 MUST 仅核销 1 张券实例。

- **IF** 分组存在未使用券
  - 页面 MUST 展示操作按钮「标记为已使用」。
- 页面 MUST 在用户核销时二次确认。
- 页面 MUST 选择该组内最早获得的未使用券（`obtained_at` 最小）作为本次核销目标。
- 页面 MUST 调用 `coupons_use({ id })` 完成核销。
- 成功后页面 MUST 刷新列表并更新分组状态/数量。

#### Scenario: Confirm then mark one coupon as used
- **GIVEN** 某个券分组存在至少 1 张未使用券
- **WHEN** 用户点击该分组卡片上的「标记为已使用」并在确认弹窗中确认
- **THEN** 页面选择该组内最早获得的未使用券 id
- **AND** 页面调用 `coupons_use({ id })`
- **AND** 成功后刷新列表
