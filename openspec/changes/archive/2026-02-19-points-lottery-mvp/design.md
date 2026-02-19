# Design: Points Lottery MVP（贝壳 & 抽奖券 & 小心愿券）

## Context
- 项目已接入 CloudBase：前端通过 `miniprogram/utils/api.js` 调用云函数；后端已使用云数据库（见 `cloudfunctions/db_init`）。
- 因存在刷分/重复提交风险，本 MVP 选择 **后端判定 + 落库**：贝壳发放 / 想念打卡 / 兑换 / 抽奖 均由云函数计算并写入数据库；前端仅负责展示与触发。
- 命名固定：贝壳（points）、想念打卡（checkin）、抽奖券（tickets）、抽奖（tab）、小心愿券（coupons）。新增文案一律进入 `miniprogram/utils/strings.js`。

## Goals / Non-Goals

**Goals:**
- 建立闭环：发布碎碎念/想念打卡 → 得贝壳 → 兑换抽奖券 → 抽奖 → 获得小心愿券 → 券包标记已使用。
- 所有资产变更可追溯、可幂等：避免重复发放与重复扣减。
- 不破坏既有首页布局与发布链路：发布仍以 `entry_create` 为主，贝壳发放为 best-effort 附加动作。

**Non-Goals:**
- 不做连续打卡加成（streak bonus）。
- 不做概率展示、活动运营、奖池在线配置、核销码/分享/转赠。

## Decisions

### Decision 1: 后端计算与落库（Cloud Functions + Cloud DB）
- **Why**：前端本地规则无法防刷；后端可使用 ledger 唯一索引实现幂等并可审计。
- **Alternative**：纯前端本地存储（风险高、易刷、不可追溯）→ 拒绝。

### Decision 2: 数据模型与集合
新增 3 个集合（均以 relationship 维度隔离，避免跨关系串账）：

1) `user_assets`
- `relationshipId: string`
- `userOpenid: string`
- `points_balance: number`（贝壳）
- `ticket_balance: number`（抽奖券）
- `last_checkin_date: string`（YYYY-MM-DD）
- `created_at: number`（ts）
- `updated_at: number`
- **Index**：unique `idx_relationshipId_userOpenid`（`{ relationshipId: 1, userOpenid: 1 }`）

2) `point_ledger`（账本：所有资产变动、幂等、防重复）
- `relationshipId: string`
- `userOpenid: string`
- `type: "murmur" | "checkin" | "exchange" | "lottery"`
- `ref_id: string`（幂等键：entry id / date / exchange id / lottery id）
- `delta_points: number`
- `delta_tickets: number`
- `meta: object`（可选：content_len/image_count/prize_key 等）
- `created_at: number`
- **Index**：unique `idx_relationshipId_userOpenid_type_refId`（`{ relationshipId: 1, userOpenid: 1, type: 1, ref_id: 1 }`）

3) `coupons`（小心愿券实例）
- `relationshipId: string`
- `userOpenid: string`
- `prize_key: string`
- `title: string`
- `desc: string`
- `status: "unused" | "used"`
- `obtained_at: number`
- `used_at: number | null`
- **Index**：`idx_relationshipId_userOpenid_obtainedAt`（`{ relationshipId: 1, userOpenid: 1, obtained_at: -1 }`）

### Decision 3: 幂等策略
- **碎碎念得贝壳**：`type="murmur"` + `ref_id=entryId`。写入 ledger 使用 unique 索引防重复。
- **想念打卡**：`type="checkin"` + `ref_id=date`（服务端 `dayKey(now)`）。
- **兑换**：`type="exchange"` + `ref_id=exchangeId`（服务端生成随机/时间戳）。
- **抽奖**：`type="lottery"` + `ref_id=lotteryId`（服务端生成）。

实现上：先尝试创建 ledger；若命中 duplicate key → 返回 `earned_points=0` / `no-op`。

### Decision 4: 防重复点击（前端）
- 首页打卡 / 抽奖页兑换 / 抽一次：前端按钮采用 loading lock（请求中禁用），避免多次触发导致并发写入与体验问题。
- 即使前端锁失效，也依赖后端 ledger 幂等与余额校验兜底。

### Decision 5: 奖池配置
- 奖池在 `cloudfunctions/lottery_draw/index.js` 内以静态数组定义（MVP 固定）。
- 抽取算法：按 weight 求和、累进随机；返回 `prize_key/title/desc` 并写入 `coupons`。

### Decision 6: 日期/时区判定
- 服务端打卡按 `dayKey(now)` 作为自然日（限制：若用户跨时区与云函数运行时区不一致，可能存在边界偏差）。
- UI 展示按客户端本地时间生成文案，但最终是否可打卡由服务端返回为准。

## Data Flow

### 1) 发布碎碎念 → 得贝壳
- `page-entry-publish`：`entry_create({ text, images })` 成功拿到 `entryId`。
- 继续调用 `points_earn({ type:"murmur", ref_id: entryId, content_len, image_count })`（best-effort）。
- 成功返回 `earned_points` 后 toast：`收纳成功 +X 贝壳`。
- 若 `points_earn` 失败：不影响发布回退（仅静默/弱提示）。

### 2) 首页想念打卡 → 得贝壳
- `page-home` 提供 pill。
- 点击后调用 `checkin()`；成功 toast：`今天的想念已收纳 +3 贝壳`。
- 随后 best-effort 调用 `assets_get()` 更新余额与打卡态。

### 3) 抽奖页兑换/抽奖
- 页面加载：`assets_get()` 获取余额。
- 点击兑换：`tickets_exchange({ count: 1 })` → 更新余额。
- 点击抽一次：`lottery_draw({ count: 1 })` → 弹窗展示结果 → 更新余额（并可提示已加入券包）。

### 4) 券包列表/使用
- 券包页加载：`coupons_list()`。
- 点击标记使用：二次确认 → `coupons_use({ id })` → 更新该券状态。

## Risks / Trade-offs
- [刷分/重复提交] → 后端 ledger unique 幂等 + 余额校验；前端按钮 loading lock。
- [抽奖被误解为博彩] → 文案克制、无“爆率/中奖”等词、奖池透明固定且无金钱属性。
- [时区边界] → MVP 以服务端日期为准，记录风险，后续可引入用户时区字段或客户端 date 参与判定并校验。

## Migration Plan
1) 更新 `db_init`：确保新集合与索引（幂等执行）。
2) 上传并部署新增云函数（assets_get/points_earn/checkin/tickets_exchange/lottery_draw/coupons_list/coupons_use）。
3) 前端上线：新增 Tab“抽奖”、新增券包页、接入发布后贝壳发放与首页打卡入口。

**Rollback**
- 前端隐藏 Tab 与入口（回退 `app.json` + 页面/入口变更）。
- 云函数侧可临时拒绝写入（返回维护中）以止损。
