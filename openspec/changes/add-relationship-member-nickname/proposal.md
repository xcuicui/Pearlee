# Change: Relationship-level Nickname System (RelationshipMember + default strategy + entry points + migration)

## Why
当前首页/情绪卡片等存在“TA/你”等占位与不一致展示，缺少“关系级昵称”的强入口与统一数据源。为符合产品定位（亲密、克制、关系被看见），需要建立 RelationshipMember 昵称系统，并确保历史数据兼容与迁移幂等。

## What Changes
- **Data model**: 新增集合 `relationship_members`，记录 (relationship_id, user_openid, nickname_in_relationship, updated_at)
  - 唯一约束：`relationship_id + user_openid`
  - `nickname_in_relationship` 可为空（历史兼容），且**不得**写入“TA/你/对方”等占位符到数据库
- **Default display strategy (server-side)**: 展示层 fallback
  - if nickname_in_relationship 非空：使用它
  - else：
    - 标题/对方来源：使用“对方”
    - 我的名称：使用“你”
  -（微信昵称不作为强依赖；如未来接入 users.wechat_nickname，可在不破坏本变更的前提下扩展 fallback）
- **Entry points**:
  - 创建关系流程新增“设定我的昵称”步骤（强入口，1-10字，不为空，禁emoji）
  - 设置页新增“在这段关系里的名字”编辑入口（弱入口）
- **Unified replacement**:
  - 首页标题、情绪卡片来源、今日概览作者统一使用 relationship nickname 体系，不再出现“TA”
- **Migration**:
  - 若无 `relationship_members`：创建集合与索引
  - 为现有 relationships 回填 member 记录（两人各一条），nickname 默认回填为 NULL
  - 迁移 MUST 幂等

## Impact
- Affected specs:
  - fn-db_init
  - fn-relationship_create, fn-relationship_join, fn-relationship_update
  - fn-ctx_get, fn-home_feed
  - page-relationship-create, page-settings, page-home
- Affected code:
  - cloudfunctions/db_init/index.js
  - cloudfunctions/relationship_create/index.js
  - cloudfunctions/relationship_join/index.js
  - cloudfunctions/relationship_update/index.js
  - cloudfunctions/ctx_get/index.js
  - cloudfunctions/home_feed/index.js
  - miniprogram/pages/relationship/create.*
  - miniprogram/pages/settings/index.*
  - miniprogram/pages/home/index.*

## Non-Goals
- 不接入/不依赖微信昵称授权流程（本次仅以关系昵称为主）
- 不新增多关系能力
