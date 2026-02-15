# Design: fn-home_feed

## Context
`home_feed` 是首页核心聚合函数，承担月历 marks 计算和情绪卡片优先级选择。

## Decisions
- 关系不存在时返回软空结果（`relationshipId: ''`），由前端负责跳转创建页。
- marks 按日聚合 unique 发布成员数映射等级：1 人=level1，2 人=level2。
- 情绪卡片按优先级选择：对方 3 天内最新记录 > 近期列表随机回退。

## Data Path
1. 查询调用者关系
2. 按 `year/month` 查询当月 entries 构建 marks
3. 推断 partner 并计算 emotion
4. 生成 today 状态并返回聚合结果

## Risks / Trade-offs
- 当月查询用于 `today.hasAny`，非当前月请求时该字段可能恒为 false。
- 回退随机策略提升“记忆感”，但降低结果可预测性。
