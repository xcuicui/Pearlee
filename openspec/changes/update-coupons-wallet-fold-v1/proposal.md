# Proposal: update-coupons-wallet-fold-v1

## Background
当前券包页按单张券逐条展示，存在同类型券重复占位的问题；用户点击“标记为已使用”时也无法体现“每次仅消耗一张”的折叠消费逻辑。

## Goals
- 券包按券类型（标题+描述）折叠分组展示。
- 每个分组展示数量与最新获得时间，减少列表噪音。
- “标记为已使用”一次仅核销一张未使用券（最早获得）。

## Non-goals
- 不调整后端 `coupons_list` / `coupons_use` 接口定义。
- 不改动空态文案与页面路由。

## Impact
- Affected specs: `page-coupons-wallet`
- Affected code:
  - `miniprogram/pages/coupons/wallet/index.js`
  - `miniprogram/pages/coupons/wallet/index.wxml`
  - `miniprogram/pages/coupons/wallet/index.wxss` (if needed)
