# Spec: points-lottery-mvp

## Purpose
在现有“记录想念”主链路上补齐奖励闭环：发布与打卡获得贝壳，贝壳兑换抽奖券，抽奖获得小心愿券，并在券包中查看与标记使用；整体保持温柔克制表达，不引入博彩暗示。

## Requirements
### Requirement: Terminology and copy consistency
变更 MUST 统一命名并沿用集中文案管理：
- points = `贝壳`
- checkin = `想念打卡`
- tickets = `抽奖券`
- lottery tab = `抽奖`
- coupons = `小心愿券`

#### Scenario: UI naming consistency
- **WHEN** 检查首页、抽奖页、设置页、券包页及相关 toast/modal
- **THEN** 所有用户可见命名与上述术语一致
- **AND** 前端文案来自统一 strings key

### Requirement: Rewards rules and idempotency
系统 MUST 实现以下规则并由后端判定：
- `points_earn`：碎碎念按字数档位 + 图片档位发放，单条 cap=16，按 `type+ref_id` 幂等
- `checkin`：自然日最多一次，首次 +3 贝壳，重复调用不重复发放
- `tickets_exchange`：固定 `10 贝壳 -> 1 抽奖券`，余额不足失败
- `lottery_draw`：消耗 1 抽奖券，固定奖池按权重随机，生成 1 张未使用小心愿券
- `coupons_use`：仅本人可操作，已使用再次操作幂等返回

#### Scenario: Duplicate requests
- **GIVEN** 同一业务请求重复触发（重复点击或重试）
- **WHEN** 服务端处理发放/打卡/核销
- **THEN** 资产变更结果保持幂等且不重复增发/扣减

### Requirement: Pages and navigation surface
前端 MUST 提供完整入口与页面行为：
- TabBar 为 3 项：`首页` / `抽奖` / `设置`
- 新增 `page-lottery`：展示贝壳/抽奖券、兑换、抽一次、奖池列表、券包入口
- 新增 `page-coupons-wallet`：展示券列表（未使用/已使用）与标记已使用操作
- `page-settings` 新增“我的券包”入口并跳转券包页

#### Scenario: Lottery to wallet flow
- **WHEN** 用户在抽奖页点击券包入口或在设置页点击“我的券包”
- **THEN** 页面跳转到 `/pages/coupons/wallet/index`

### Requirement: API surface contract
变更 MUST 覆盖如下云函数接口并保持约定返回：
- `assets_get()` -> `{ ok, relationshipId, assets }`
- `points_earn({ type, ref_id, content_len, image_count })`
- `checkin()`
- `tickets_exchange({ count: 1 })`
- `lottery_draw({ count: 1 })`
- `coupons_list()`
- `coupons_use({ id })`
- `db_init` 需包含 `user_assets/point_ledger/coupons` 集合与索引保障

#### Scenario: Frontend integration contract
- **WHEN** 前端页面调用上述接口
- **THEN** 能完成资产刷新、兑换、抽奖结果展示、券包查询与核销
- **AND** 异常时返回明确业务错误（如 `NO_REL`、`INSUFFICIENT_POINTS`、`INSUFFICIENT_TICKETS`）
