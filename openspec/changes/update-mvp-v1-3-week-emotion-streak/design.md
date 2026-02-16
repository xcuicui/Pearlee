## Context
v1.3 将首页从“月历点亮”聚焦为“周历条 + 现在优先情绪卡片 + 连续系统”，以更轻量的时间叙事增强留存。

## Goals
- 周历条（周一开始）可快速感知一周是否被点亮
- 现在优先：优先展示对方近 3 天最新记录
- 连续系统：以任意一方每日≥1条记录为连续规则
- 轻量发布：允许纯图片（仍禁止全空）

## Non-Goals
- 月历首页
- 多关系
- 手帐/贴纸风

## Decisions
- home_feed 返回 week.activeDates（以及可选 levelByDate）而非返回整套 7 天 cell，前端生成结构。
- streak 推荐写入时更新 RelationshipStats，home_feed 消费结果。
- images 按 `{url,width,height}` 结构化保存，tempUrl 不落库。

## Risks / Trade-offs
- 接口变更（breaking）：需要同步更新前端与云函数。
- 云存储权限为仅创建者可读时，图片展示必须走临时链接签发策略（已在现有实现中采用）。

## Migration Plan
- 先通过 change deltas 修改 spec
- 实现完成并发布后，再 archive change 并将 changes 合并进 specs。
