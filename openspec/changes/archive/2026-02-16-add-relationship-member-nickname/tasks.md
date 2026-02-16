## 1. Spec
- [ ] 1.1 Review proposal
- [ ] 1.2 Write deltas for affected capabilities
- [x] 1.3 openspec validate add-relationship-member-nickname --strict --no-interactive

## 2. Implementation (after approval)
- [x] 2.1 db_init：创建 relationship_members 集合 + 索引
- [x] 2.2 迁移：为历史 relationships 回填 relationship_members（幂等）
- [x] 2.3 relationship_create：创建后写入当前用户 member 记录与昵称
- [x] 2.4 relationship_join：加入后写入当前用户 member 记录（昵称为 NULL 或由输入提供）
- [x] 2.5 relationship_update：新增 PATCH /relationship/me/nickname 能力（或等价字段）写入 member
- [x] 2.6 ctx_get：返回 me/partner nicknames（已做 fallback）供设置页使用
- [x] 2.7 home_feed：返回 myNickname/partnerNickname（已做 fallback），并替换所有“TA/你”来源字段
- [x] 2.8 创建关系页：新增设定昵称步骤并保存
- [x] 2.9 设置页：新增编辑入口；保存后返回首页触发刷新
- [x] 2.10 首页：标题/情绪卡片/今日概览统一展示昵称，杜绝“TA”

## 3. Tests
- [x] 3.1 云函数校验：nickname 非空/长度/emoji 拦截/权限
- [x] 3.2 home_feed：fallback 正确（无昵称时显示“对方/你”）
- [x] 3.3 迁移幂等：重复执行不产生重复 member 数据
- [x] 3.4 前端回归：创建流程保存昵称；设置页修改后首页立即生效；历史数据不崩溃

## 4. Archive (after deployment)
- [ ] 4.1 openspec archive add-relationship-member-nickname
