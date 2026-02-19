# Spec: gift-showcase-recipient-rarity-delete-v1

## 0. Summary
完善“小礼物橱窗”机制：
1) 礼物支持“送给谁”（recipient）
2) 抽礼物时只从“送给我”的礼物池抽
3) 上传礼物支持稀有度配置（常见/偶尔/稀有）
4) 支持“移出橱窗”（软删除）
5) 删除后不影响已抽到的历史礼物（RewardInstance snapshot）
6) UI 不展示概率/百分比/权重数字

## 1. 数据模型（关系空间内）

### 1.1 GiftDefinition
GiftDefinition MUST 存在于关系空间（space）内，并支持以下字段：
- `id`
- `space_id`（= relationshipId）
- `title`
- `description`
- `rarity`: `common | occasional | rare`
- `recipient_user_id`
- `created_by_user_id`
- `is_active`: boolean
- `is_deleted`: boolean
- `created_at`
- `updated_at`
- `deleted_at` (optional)

### 1.2 RewardInstance（口袋里的小礼物）
RewardInstance MUST 记录一次抽取结果，并包含 snapshot 字段用于历史展示：
- `id`
- `gift_id` (optional for legacy)
- `recipient_user_id`
- `gift_title_snapshot`
- `gift_desc_snapshot`
- `rarity_snapshot`: `common|occasional|rare` (optional for legacy)
- `created_at`

> 说明：RewardInstance MUST 冗余 snapshot 字段，避免 GiftDefinition 被删除后无法展示历史礼物。

## 2. 权限规则
- 仅 `created_by_user_id` 可对该 GiftDefinition 执行“移出橱窗（软删除）”。
- recipient 用户无权删除对方创建的礼物。

## 3. 稀有度机制

### 3.1 rarity -> weight 映射（仅后端）
后端 MUST 通过固定映射将 rarity 转为抽取权重：
- `common`: 15
- `occasional`: 8
- `rare`: 3

约束：
- 前端 MUST NOT 传入 weight。
- UI MUST NOT 展示权重或概率百分比。

## 4. 删除机制（软删除）

### 4.1 移出橱窗
移出橱窗操作 MUST：
- `is_deleted = true`
- `deleted_at = now()`

影响范围：
- 橱窗列表 MUST 不展示已删除礼物
- 抽取池 MUST 不包含已删除礼物
- 历史 RewardInstance MUST 不受影响（使用 snapshot 继续展示）

## 5. 抽奖页（DrawPage）抽取规则
抽取池查询条件 MUST 为：
- `recipient_user_id = currentUser`
- `is_active = true`
- `is_deleted = false`

抽取算法 MUST：
- 从上述池中按 rarity->weight 加权随机选取 gift
- 扣 1 贝壳
- 生成 RewardInstance（写入 snapshot）

若池为空：
- 抽取按钮 MUST 禁用
- 提示 MUST 为：`橱窗里还没有给你的小礼物。`

## 6. UI 文案 keys
- 稀有度文案：常见/偶尔/稀有 与对应副文案
- 删除确认弹窗文案：标题/说明/按钮
- DrawPage 空池提示
