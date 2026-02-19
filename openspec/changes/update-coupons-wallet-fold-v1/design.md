# Design: update-coupons-wallet-fold-v1

## Grouping strategy
- 分组 key：`key = trim(title) + '__' + trim(desc)`。
- 组内包含多张券实例（每张有独立 `id/status/obtained_at`）。

## Rendering strategy
- 列表渲染分组后的 `groups[]`。
- 标题行显示 `title`，若 `count>1` 展示 `×N`。
- 状态：若 `unusedCount>0` → 未使用；否则 → 已使用。
- 时间：展示该组内 `obtained_at` 最大值（最新获得时间）。

## Consume-one behavior
- 点击“标记为已使用”时，仅核销 1 张券：选择该组内 **最早获得** 的未使用券（`obtained_at` 最小）对应的 `id` 作为 `coupons_use({id})` 参数。

## Compatibility
- 不修改后端返回字段，仅前端聚合与渲染。
