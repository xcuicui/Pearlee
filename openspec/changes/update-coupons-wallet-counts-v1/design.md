# Design: update-coupons-wallet-counts-v1

## UI copy
- 统计行文案固定为：`已获得 X 张 · 已使用 Y 张 · 还剩 Z 张`
- 语气偏生活化，避免“核销”等商家语境词。

## Computation
在分组聚合时计算：
- `totalCount = coupons.length`
- `unusedCount = coupons.filter(status!=='used').length`
- `usedCount = totalCount - unusedCount`

## Placement
- 将统计行放在描述与时间之间，信息密度适中，且不影响现有 CTA。
