# Proposal: update-coupons-wallet-counts-v1

## Background
券包页已支持按券类型折叠（`×N`）并一次仅使用 1 张券，但当前仍缺少“总共拿到多少 / 用掉多少 / 还剩多少”的清晰表达。

在情侣小程序的语境里，券更像“收到的小心愿/小礼物券”，用户最关心的是：还剩几张可用。

## Goals
- 在每个折叠分组卡片中展示统计：`已获得 X 张 · 已使用 Y 张 · 还剩 Z 张`。
- 保持现有折叠分组与“标记为已使用”行为不变（一次只使用 1 张，优先使用最早获得的未使用券）。

## Non-goals
- 不调整云函数与数据库结构。
- 不新增二级详情页。

## Impact
- Affected specs: `page-coupons-wallet`
- Affected code:
  - `miniprogram/pages/coupons/wallet/index.js`
  - `miniprogram/pages/coupons/wallet/index.wxml`
  - `miniprogram/pages/coupons/wallet/index.wxss`（如需样式）
