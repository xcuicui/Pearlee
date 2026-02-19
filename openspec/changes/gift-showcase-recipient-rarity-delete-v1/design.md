# Design: gift-showcase-recipient-rarity-delete-v1

## 页面与数据流

### 1) AddGiftPage（上传礼物）
- 输入：title(<=12 必填)、description(<=40 可选)、rarity(必选，默认 occasional)、recipient(必选，默认对方)
- 提交：调用后端 upsert/create GiftDefinition

### 2) ShopDetailPage（橱窗详情）
顶部 segmented：
- 给我：`recipient_user_id = currentUser`
- 我送出：`created_by_user_id=currentUser AND recipient_user_id=partnerUser`

卡片展示：title/desc/rarity 标签 + 轻量来源小字：
- 给我：`来自 {对方昵称}`
- 我送出：`送给 {对方昵称}`

创建者操作：
- 移出橱窗（软删除，二次确认）
- （可选）暂时收起 is_active=false

### 3) DrawPage（抽礼物）
- 点击抽取：调用 `lottery_draw`（后端从 gift_definitions 查询池并加权随机）
- 后端生成 RewardInstance（建议复用 coupons collection 或新 collection，必须保证 snapshot 完整）
- 前端展示结果卡片（温柔、不博彩）

## Snapshot 机制
RewardInstance 以 snapshot 字段展示历史礼物：
- 若 GiftDefinition 已删除/不存在：仍显示 snapshot 标题与描述
- 可附加 secondaryText：`已从橱窗移出`

## 兼容策略
- 现有 pocket 礼物数据（当前 coupons）视为 legacy RewardInstance：
  - 沿用 `title/desc/obtained_at` 作为 snapshot
  - `gift_id/rarity_snapshot` 可为空，展示时降级处理
