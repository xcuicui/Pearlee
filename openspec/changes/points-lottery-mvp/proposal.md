# Change: Points Lottery MVP（贝壳抽奖 MVP）

## Background
当前小程序仅有 2 个 Tab（`首页`、`设置`），发布流程为 `page-entry-publish` 调用 `entry_create({ text, images })` 成功后返回上一页；关系上下文由 `ctx_get` 提供（含 relationship、me/partner 昵称），设置页已依赖该上下文。

后端已具备 CloudBase 基础数据与关系域集合（`users`、`relationships`、`relationship_members`、`entries`、`likes`、`comments`、`relationship_stats`），前端网络层通过 `miniprogram/utils/api.js` 统一封装 `wx.cloud.callFunction`，文案通过 `miniprogram/utils/strings.js` 统一管理。这为在 MVP 阶段增量加入轻量激励闭环提供了稳定基础。

## Why
为“记录想念”行为建立正向反馈：发布碎碎念与日常打卡可获得 `贝壳`，`贝壳` 可兑换 `抽奖券`，通过 `抽奖` 获得 `小心愿券` 并在券包中管理与核销。目标是在不破坏现有核心记录链路的前提下，提高回访率与互动动机。

## What Changes
- 新增资产与抽奖能力（云函数）：
  - `fn-assets_get`：获取贝壳余额、抽奖券余额与小心愿券统计
  - `fn-points_earn`：碎碎念发布后发放贝壳，需幂等
  - `fn-checkin`：`想念打卡`，按自然日幂等
  - `fn-tickets_exchange`：`10 贝壳 -> 1 抽奖券`
  - `fn-lottery_draw`：消耗 1 抽奖券并发放小心愿券
  - `fn-coupons_list`：查询小心愿券列表
  - `fn-coupons_use`：核销/使用小心愿券
- 新增页面能力：
  - `page-lottery`：新增 Tab 页面，Tab 名固定为 `抽奖`
  - `page-coupons-wallet`：小心愿券列表页（我的券包）
- 修改现有页面能力：
  - `page-entry-publish`：保持 `entry_create` 成功链路不变，在成功后触发贝壳发放（通过 `fn-points_earn`，幂等）
  - `page-home`：新增轻量 `想念打卡` 胶囊入口
  - `page-settings`：新增“我的券包”入口，跳转 `page-coupons-wallet`
- 修改初始化能力：
  - `fn-db_init`：新增并初始化 assets/ledger/coupons 等所需集合与索引（幂等建表、幂等索引）
- 命名与文案约束（全量遵循产品命名）：
  - points = `贝壳`
  - checkin = `想念打卡`
  - tickets = `抽奖券`
  - lottery tab = `抽奖`
  - coupons = `小心愿券`
  - 所有新增前端文案继续走 `miniprogram/utils/strings.js` 集中管理

## Non-Goals
- 不调整关系模型与既有 entry/comment/like 的核心数据语义
- 不引入复杂活动运营系统（多奖池、多级概率配置、限时活动）
- 不在本次变更中扩展为可提现或任何现金等价物体系

## Risks
- 反作弊风险：刷发布、刷打卡、重复请求导致异常增发。
- 合规与认知风险：`抽奖`文案与交互可能被误解为博彩。
- 体验风险：若抽奖/核销失败回滚不一致，可能导致用户资产感知错误。

## Rollback
- 通过 feature flag 快速关闭抽奖链路入口（Tab/入口隐藏 + 云函数拒绝策略）以止损。
- 保留单次快速回退提交：将 `page-lottery`、`page-coupons-wallet`、新增云函数注册与入口变更整体回滚。
- 出现资产发放异常时，优先关闭 `fn-points_earn`/`fn-checkin` 写入，再通过 ledger 对账补偿。

## Impact
- Affected specs:
  - `fn-assets_get`
  - `fn-points_earn`
  - `fn-checkin`
  - `fn-tickets_exchange`
  - `fn-lottery_draw`
  - `fn-coupons_list`
  - `fn-coupons_use`
  - `page-lottery`
  - `page-coupons-wallet`
  - `page-entry-publish`
  - `page-home`
  - `page-settings`
  - `fn-db_init`
- Affected code:
  - `miniprogram/app.json`（TabBar 新增 `抽奖`）
  - `miniprogram/pages/lottery/*`（新）
  - `miniprogram/pages/coupons/wallet/*`（新）
  - `miniprogram/pages/entry/publish.js`
  - `miniprogram/pages/home/index.*`
  - `miniprogram/pages/settings/index.*`
  - `miniprogram/utils/strings.js`
  - `cloudfunctions/db_init/index.js`
  - `cloudfunctions/assets_get/index.js`（新）
  - `cloudfunctions/points_earn/index.js`（新）
  - `cloudfunctions/checkin/index.js`（新）
  - `cloudfunctions/tickets_exchange/index.js`（新）
  - `cloudfunctions/lottery_draw/index.js`（新）
  - `cloudfunctions/coupons_list/index.js`（新）
  - `cloudfunctions/coupons_use/index.js`（新）
