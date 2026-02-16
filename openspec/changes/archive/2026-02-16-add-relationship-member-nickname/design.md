## Context
需要建立关系级昵称系统，统一首页/情绪等展示，并兼容历史 relationships 数据。

## Decisions
- 新增集合 `relationship_members`：以 (relationship_id, user_openid) 唯一，昵称可空。
- 默认昵称策略只在展示层 fallback：不把“TA/你/对方”等写入 DB。
- 为减少前端复杂度：home_feed/ctx_get 在服务端返回已做 fallback 的 myNickname/partnerNickname。

## Migration Plan (Idempotent)
- db_init 确保集合与索引存在。
- 迁移逻辑在 db_init 或独立 migrate 函数中：
  - 遍历 relationships（archived=false 或全量）
  - 对 memberOpenids 中每个 openid，upsert relationship_members 记录：
    - 若已存在则跳过
    - 若不存在则创建 nickname_in_relationship = NULL

## Risks
- 现有代码使用 relationships.memberNicknames：需要平滑切换并保持读取兼容（读 member 表优先，旧字段仅用于过渡）。
