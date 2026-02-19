## MODIFIED Requirements

### Requirement: Coupon group card SHALL show obtained/used/remaining counts
券包页在折叠分组卡片中 MUST 展示券的统计信息，以帮助用户理解同类券的使用进度。

- 页面 MUST 在每个券分组卡片中展示统计行：`已获得 X 张 · 已使用 Y 张 · 还剩 Z 张`。
- `X` MUST 等于该分组券实例总数。
- `Z` MUST 等于该分组未使用券实例数量。
- `Y` MUST 等于 `X - Z`。

#### Scenario: Render group counts
- **GIVEN** 某券分组有 2 张券实例，其中 1 张已使用、1 张未使用
- **WHEN** 用户进入券包页并查看该分组卡片
- **THEN** 页面展示：`已获得 2 张 · 已使用 1 张 · 还剩 1 张`
