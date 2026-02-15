# Design: page-home

## Context
首页需要一次请求聚合关系上下文、月历点亮、情绪卡片和今日状态，避免多次云函数调用带来的首屏抖动。

## Decisions
- 使用 `home_feed` 作为首页唯一聚合入口。
- 页面状态以 `month(year, month)` 为刷新主键，切月即重新请求。
- 情绪卡片点击优先路由至日详情（带 `focus`），无 entry 时回落到发布页。

## Risks / Trade-offs
- `today.hasAny` 基于当次月份查询结果，跨月查看时可能不反映“当天真实状态”。
- 情绪回退包含随机性，页面重复刷新可能出现内容变动。
