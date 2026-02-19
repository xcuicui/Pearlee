# Tasks: lottery-ceremony-animation

## Repo Scan Notes (paths + purpose)

### Routing / TabBar
- `miniprogram/app.json`
  - TabBar 已存在 `pages/lottery/index`（抽奖页）

### Current Lottery Page
- `miniprogram/pages/lottery/index.(js|wxml|wxss|json)`
  - 当前按钮：兑换 / 抽一次
  - 当前奖池展示包含百分比（`weightText: "20%"`）
  - 当前结果展示：`wx.showModal(...)`

### Rewards API client
- `miniprogram/utils/rewards.js`
  - `drawLottery()` -> 调云函数 `lottery_draw({count:1})`

### Backend Lottery
- `cloudfunctions/lottery_draw/index.js`
  - 服务端扣券与发券
  - 当前权重随机 `pickPrize()` 使用 `Math.random()`，且不是按“纯函数 drawPrize(pool,r)”形式

### Shared helpers
- `cloudfunctions/lottery_draw/_shared/index.js`
  - `BizError/now/rid` 等工具

---

## Plan

## 1) OpenSpec artifacts
- [ ] 1.1 在 change 下新增 specs deltas：
  - `specs/page-lottery/spec.md`（抽奖页结构+动效仪式）
  - `specs/fn-lottery_draw/spec.md`（服务端纯函数加权随机）
- [ ] 1.2 `openspec validate lottery-ceremony-animation --strict --no-interactive`

## 2) Backend: weighted random refactor
- [ ] 2.1 在 `cloudfunctions/lottery_draw/index.js` 引入纯函数 `drawPrize(pool, r)`
- [ ] 2.2 用 `crypto.randomBytes` 生成 `r`（0..totalWeight），并调用 `drawPrize`
- [ ] 2.3 保持接口返回结构不变

## 3) Frontend: ceremony UI
- [ ] 3.1 抽奖页改版为「小礼物橱窗」结构：标题/副标题/资产行/主按钮
- [ ] 3.2 删除百分比展示，改为稀有度标签（常见/偶尔/稀有）
- [ ] 3.3 增加 overlay + result card 组件结构（wxml + wxss）
- [ ] 3.4 增加状态机：idle/drawing/result/confirmed（page data）
- [ ] 3.5 动效：overlay dim+blur；卡片淡入/上浮/缩放（300~400ms ease-out）
- [ ] 3.6 结果卡按钮「收进礼物盒」：关闭 overlay；可选提供跳券包入口

## 4) Strings
- [ ] 4.1 新增/调整 strings key（避免页面硬编码）
  - 页面标题/副标题/按钮文案/底部小字/稀有度标签

## 5) Self-test (manual)
- [ ] 5.1 ticket_balance=0：按钮禁用且提示不突兀
- [ ] 5.2 有券：点击后 800~1200ms 内完成仪式 → 出结果卡
- [ ] 5.3 点确认关闭，资产刷新正确（扣 1 张券）
- [ ] 5.4 无转盘/老虎机/概率高亮

## 6) Validation
- [ ] 6.1 `openspec validate lottery-ceremony-animation --strict --no-interactive`
