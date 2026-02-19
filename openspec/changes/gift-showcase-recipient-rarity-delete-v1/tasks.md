# Tasks: gift-showcase-recipient-rarity-delete-v1

## 0) Repo scan（必须先做）
- [x] 0.1 当前 GiftDefinition 位置盘点（现为常量奖池）
- [x] 0.2 当前抽奖逻辑位置盘点
- [x] 0.3 口袋礼物实例结构盘点（当前 coupons）
- [x] 0.4 space_id/partnerUser 获取方式盘点（ctx_get / relationshipId）
- [x] 0.5 贝壳余额扣减逻辑盘点（lottery_draw 扣 points_balance -1）

## 1) OpenSpec
- [ ] 1.1 补齐 change 文档：`proposal.md`、`spec.md`、`design.md`、`tasks.md`
- [ ] 1.2 新增 delta specs（至少包含数据模型与接口变更）：
  - `specs/fn-lottery_draw/spec.md`
  - `specs/fn-gift_definitions_upsert/spec.md`（新增）
  - `specs/fn-gift_definitions_list/spec.md`（新增）
  - `specs/fn-gift_definitions_delete/spec.md`（新增：软删除）
  - `specs/page-window-detail/spec.md`（橱窗详情 segmented + 删除入口）
  - `specs/page-gift-add/spec.md`（新增上传礼物页）
  - `specs/page-draw/spec.md`（DrawPage 空池提示/禁用规则）
- [ ] 1.3 运行 `openspec validate gift-showcase-recipient-rarity-delete-v1 --strict --no-interactive` 并通过

## 2) Backend
- [ ] 2.1 新增集合：gift_definitions（GiftDefinition）
- [ ] 2.2 新增云函数：gift_definitions_upsert / list / delete（软删，鉴权 created_by）
- [ ] 2.3 修改 lottery_draw：
  - 从 gift_definitions 查询 recipient=currentUser 且 active 且 not deleted
  - rarity->weight 映射由后端计算
  - 加权随机选 gift
  - 生成 RewardInstance（写入 snapshot）
  - 池为空报错 code=POOL_EMPTY（供前端禁用提示）

## 3) Mini Program
- [ ] 3.1 ShopDetailPage：橱窗详情页改为后端列表 + segmented（给我 / 我送出）
- [ ] 3.2 AddGiftPage：新增上传礼物页（title/desc/rarity/recipient）
- [ ] 3.3 删除入口：仅创建者可见；二次确认；成功后列表刷新
- [ ] 3.4 DrawPage：空池禁用 + 提示 `橱窗里还没有给你的小礼物。`
- [ ] 3.5 Pocket（口袋里的小礼物）展示 rarity_snapshot（如有）以及“已从橱窗移出”提示（若 gift 已 deleted）

## 4) Verification / Self-test
- [ ] 4.1 我能为 TA 添加礼物（recipient=TA）
- [ ] 4.2 TA 能在“给我”里看到我送给 TA 的礼物
- [ ] 4.3 我抽礼物只抽到 TA 给我的礼物（recipient=我）
- [ ] 4.4 稀有度加权生效（后端映射 common=15 occasional=8 rare=3）
- [ ] 4.5 UI 不展示概率/百分比
- [ ] 4.6 创建者可移出橱窗（软删除），recipient 无权删除
- [ ] 4.7 删除后不可抽
- [ ] 4.8 历史 RewardInstance 仍可展示（snapshot）
- [ ] 4.9 无报错
