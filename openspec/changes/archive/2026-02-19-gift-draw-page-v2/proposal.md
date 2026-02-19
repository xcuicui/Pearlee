# Proposal: gift-draw-page-v2

## Background
当前抽奖页（`pages/lottery/index`）经历过「微仪式动效」与「去百分比展示」的优化，但用户仍容易困惑：
- “抽奖”和“贝壳”的关系不清晰
- 页面同时出现「抽奖券/小礼物券」与兑换行为，理解成本高

## Goals
按新的信息架构重构抽奖页，让用户一眼理解：
- 抽一次 **消耗 1 枚贝壳（points_balance）**（不再使用抽奖券/ticket）
- 展示「口袋里的小礼物」（已获得的礼物券列表，最近 3 条）
- 提供入口「查看小礼物橱窗」进入橱窗详情页（展示全部礼物 + 稀有度：常见/偶尔/稀有；不显示百分比）

## Non-goals
- 不做转盘/老虎机/概率高亮
- 不展示任何概率数字（百分比/中奖率）
- 不引入新依赖（动效/组件库/状态库）
- 不改动与抽奖无关的页面

## Risks & Mitigations
- 风险：从 ticket 体系切到 points 体系会影响现有逻辑
  - 缓解：仅改动抽奖相关云函数与抽奖页；保持可回滚；接口返回保持兼容（必要字段保留）。
- 风险：数据一致性（并发/重复点击）
  - 缓解：前端 loading lock；服务端写 ledger 并生成 coupon；建议增加 request_id 幂等（本 change 最小实现以 lock 为主，如需幂等索引则在 spec 中明确）。

## Rollback
- 前端：回滚 `pages/lottery` 与新增橱窗详情页即可恢复旧 UI。
- 后端：回滚 `lottery_draw` 对 points 的扣减逻辑（恢复 ticket 消耗）。
