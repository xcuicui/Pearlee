## MODIFIED Requirements

### Requirement: ShopDetailPage segmented and delete
橱窗详情页 MUST 增加分段切换，并支持创建者“移出橱窗”（软删除）。

#### Segmented
顶部 segmented MUST 包含：
- `给我`：展示 `recipient_user_id=currentUser` 的礼物
- `我送出`：展示 `created_by_user_id=currentUser AND recipient_user_id=partnerUser` 的礼物

#### Gift card
礼物卡片 MUST 展示：
- 名称
- 描述
- 稀有度标签（常见/偶尔/稀有，不展示权重/百分比）
- 来源小字：
  - 给我：`来自 {对方昵称}`
  - 我送出：`送给 {对方昵称}`

#### Delete
- 若当前用户为礼物创建者，卡片 MUST 提供操作入口 `移出橱窗`。
- 点击 `移出橱窗` MUST 二次确认：
  - 标题：`移出这份小礼物？`
  - 说明：`移出后它不会再出现在橱窗里，也不会再被抽到。`
  - 按钮：取消 / 移出
- 确认后 MUST 调用 `gift_definitions_delete({id})` 并刷新列表。

#### Scenario: Switch segments
- **WHEN** 用户切换 segmented
- **THEN** 页面刷新对应列表
