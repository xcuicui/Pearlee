# Design: lottery-ceremony-animation

## Backend vs Frontend
- 本项目已接入 CloudBase 云函数与云数据库。
- 随机算法与扣券/发券 MUST 在服务端云函数 `lottery_draw` 执行。
- 前端仅负责：状态机、动效、展示结果、刷新资产。

## State Machine
状态：`idle → drawing → result → confirmed`

状态流：
1) `idle`
- 按钮可点击条件：`ticket_balance >= 1`

2) 点击「打开一份小礼物」
- 前端检查 `ticket_balance >= 1`
- 进入 `drawing`
- UI：背景变暗+轻微 blur；中心卡片占位（或 loading）浮出

3) `drawing`
- 调用 `lottery_draw({ count: 1 })`
- 服务端完成：扣减 1 张券 → 加入 ledger → 生成 coupon
- 成功返回后：进入 `result`

4) `result`
- UI：结果卡片填充标题/描述（淡入+上浮+scale）
- 显示按钮「收进礼物盒」

5) 用户点击「收进礼物盒」
- 进入 `confirmed`
- UI：仪式层关闭，页面回到 `idle`，并刷新资产（若未刷新）
- 可选：跳转券包页（MVP 默认不自动跳转，避免打断）

## Ceremony Animation Implementation
### Layers
- `overlay`: 全屏遮罩，控制 dim + blur
- `resultCard`: 中央礼物卡片

### Timing (target total 800~1200ms)
- t=0ms: 进入 drawing，overlay 显示（opacity 0→1, 180ms）
- t=120~200ms: resultCard container 出现（scale/translate/opacity, 320~380ms）
- 网络返回后：填充卡片内容
- 用户点击确认：overlay 淡出（180ms）

### Avoid gambling feel
- 无转盘、无滚动列表、无闪烁
- 无概率数值展示
- 文案强调“礼物/收纳/礼物盒”

## Weighted Random Algorithm (server)
- 纯函数：`drawPrize(pool, r)`
- `r` 由服务端生成：使用 `crypto.randomBytes` 生成随机整数/浮点，避免前端随机。
- pool 数据结构包含：`prize_key/title/desc/weight`。

## Weight-to-rarity Mapping (frontend display)
将 weight 映射为展示标签（不展示百分比）：
- `>= 18` → `常见`
- `10~17` → `偶尔`
- `< 10` → `稀有`

（该映射只用于 UI 标签，不影响服务端抽奖权重。）
