# Tasks: gift-draw-page-v2

## Repo scan (confirmed)

### 抽奖页/Tab 路由与文件路径
- TabBar: `miniprogram/app.json` -> `pages/lottery/index`
- 抽奖页文件：
  - `miniprogram/pages/lottery/index.js|wxml|wxss|json`

### 资产 points_balance 来源与更新逻辑
- 前端：`miniprogram/utils/rewards.js#refreshAssets()` 调 `assets_get`
- 后端：`cloudfunctions/assets_get/index.js` 返回：
  - `assets.points_balance`
  - `assets.ticket_balance`
  - `assets.coupon_counts`

### 是否已有券包/我的礼物页
- 已有券包页：`miniprogram/pages/coupons/wallet/index.*`
- 数据来自 `rewards.listCoupons()` -> 云函数 `coupons_list`

### 是否已有奖池配置（prize pool config）
- 服务端奖池常量：`cloudfunctions/lottery_draw/index.js` 内 `PRIZE_POOL`（包含 `prize_key/title/desc/weight`）
- 当前抽奖消耗：`ticket_balance - 1`

### 网络层封装与后端能力
- 网络封装：`miniprogram/utils/api.js`（wx.cloud.callFunction）
- 抽奖客户端封装：`miniprogram/utils/rewards.js#drawLottery()` -> `lottery_draw`
- 后端能力：CloudBase 云函数 + 云数据库（`user_assets/point_ledger/coupons`）

---

## Implementation plan (minimal diff, rollback-friendly)

## 1) OpenSpec artifacts
- [ ] 1.1 写 proposal/spec/design/tasks（本文件与同目录）
- [ ] 1.2 写 specs deltas：
  - `specs/page-draw/spec.md`
  - `specs/page-window-detail/spec.md`
  - `specs/fn-lottery_draw/spec.md`
- [ ] 1.3 `openspec validate gift-draw-page-v2 --strict --no-interactive`

## 2) Strings
- [ ] 2.1 新增/调整 strings keys（避免页面硬编码）：
  - DrawPage A~E 文案
  - 余额不足提示
  - Pocket 区标题/空态/查看全部
  - WindowDetail 标题/副标题
  - 稀有度标签（常见/偶尔/稀有）

## 3) Backend: draw consumes points
- [ ] 3.1 修改 `cloudfunctions/lottery_draw/index.js`
  - 校验 `points_balance >= 1`
  - 扣减 `points_balance - 1`
  - ledger 写入 `delta_points=-1, delta_tickets=0`
  - 保持 weighted random `drawPrize(pool, r)`
  - 返回 `coupon`（可选补 `points_balance`）

## 4) DrawPage restructure (A~E)
- [ ] 4.1 重构 `miniprogram/pages/lottery/index.wxml` 为 A~E 结构
- [ ] 4.2 `index.js`：
  - 读取 points_balance
  - draw guard points_balance>=1
  - 加载 pocket gifts（recent 3 from coupons_list）
  - 点击查看全部跳 wallet
  - 点击查看橱窗跳 WindowDetail
- [ ] 4.3 `index.wxss`：生活方式杂志风（留白、弱卡片），最小改动，复用现有 button 样式

## 5) New WindowDetailPage
- [ ] 5.1 新增页面目录：`miniprogram/pages/lottery/window/`
- [ ] 5.2 注册路由到 `miniprogram/app.json` pages
- [ ] 5.3 页面展示全量礼物 + 稀有度（按 spec 阈值，不显示百分比）

## 6) Validation
- [ ] 6.1 `openspec validate gift-draw-page-v2 --strict --no-interactive`

## 7) Manual self-test checklist
- [ ] 7.1 抽奖页按 A~E 展示
- [ ] 7.2 文案：你有 X 枚贝壳，抽小礼物一次消耗 1 枚贝壳
- [ ] 7.3 抽奖成功：points_balance -1，券写入 pocket，弹层文案正确
- [ ] 7.4 points_balance=0：按钮禁用，小字提示为 spec 文案
- [ ] 7.5 pocket 区：无券空态；有券显示最近 3 条 + 时间
- [ ] 7.6 查看全部跳 wallet
- [ ] 7.7 查看小礼物橱窗可进入详情页并展示稀有度标签（无百分比）
- [ ] 7.8 无报错
