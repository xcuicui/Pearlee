# Spec: lottery-ceremony-animation

## Terms
- 贝壳：points / `points_balance`
- 小礼物券：抽奖券 / `ticket_balance`
- 小礼物橱窗：抽奖页（Tab）
- 礼物盒：券包（我的小心愿券列表页）

## Randomness (Weighted Random)
抽奖 MUST 使用加权随机算法（Weighted Random）。

奖池示例（至少 7 项）：
```json
[
  { "key": "coffee", "weight": 20 },
  { "key": "milk_tea", "weight": 20 },
  { "key": "shopping", "weight": 15 },
  { "key": "play", "weight": 15 },
  { "key": "sing", "weight": 10 },
  { "key": "wish", "weight": 5 },
  { "key": "hug", "weight": 15 }
]
```

算法：
1. `totalWeight = sum(weights)`
2. `r = random(0, totalWeight)`
3. 遍历累加权重区间匹配

实现约束：
- 必须写成纯函数：`drawPrize(pool, r): Prize`
  - `pool` 为奖池数组
  - `r` 为 `[0, totalWeight)` 的随机数
- 禁止在 UI 层直接进行 `Math.random()` 抽奖。
- 本项目有后端（CloudBase 云函数），因此 **抽奖随机 MUST 在服务端生成**，前端仅展示结果。

## UX: Ceremony Animation (No gambling feel)
目标体验：点击“打开一份小礼物”后：
- 页面背景 opacity 降低到约 `0.6`，并轻微 blur
- 中央浮出结果卡（scale 0.95→1，translateY 8px→0，opacity 0→1）
- 动画单段 300~400ms，ease-out
- 总流程 800ms ~ 1200ms

禁止：转盘 / 老虎机 / 概率高亮 / 闪烁爆炸。

结果卡文案结构：
- 顶部：`你打开了一份小礼物`
- 标题：奖品标题（大号）
- 描述：奖品描述（小号）
- 主按钮：`收进礼物盒`
- 底部小字：`已使用 1 张小礼物券`

## Page Structure (Lottery Tab)
抽奖页标题与结构 MUST 调整为：
- 标题：`小礼物橱窗`
- 副标题：`偶尔为彼此准备一点小惊喜。`
- 资产行：`你有 X 枚贝壳  Y 张小礼物券`
- 主按钮：`打开一份小礼物`
  - 次文案：`消耗 1 张小礼物券`
- 橱窗里的小礼物：卡片陈列
  - 不再展示百分比
  - 改为：`常见 / 偶尔 / 稀有`（按权重映射）

## API Contract
- 抽奖仍由云函数 `lottery_draw({ count: 1 })` 执行
- 响应必须包含：
  - `coupon: { id, prize_key, title, desc, status, obtained_at, used_at }`
  - 以及最新 `ticket_balance`
