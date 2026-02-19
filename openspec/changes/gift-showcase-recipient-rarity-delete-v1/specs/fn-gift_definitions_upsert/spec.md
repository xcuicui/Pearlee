## ADDED Requirements

### Requirement: Create or update a GiftDefinition
云函数 `gift_definitions_upsert` MUST 允许当前用户在关系空间内创建或更新一条 GiftDefinition。

#### Input
- `id` (optional): 不传则创建；传入则更新
- `title` (required, <=12)
- `description` (optional, <=40)
- `rarity` (required): `common|occasional|rare`
- `recipient_user_id` (required)
- `is_active` (optional, default true)

#### Authorization
- 云函数 MUST 要求当前用户已建立关系（relationship）。
- 更新时，若目标 GiftDefinition 的 `created_by_user_id != currentUser`，云函数 MUST 拒绝（FORBIDDEN）。

#### Stored fields
- 云函数 MUST 写入：`space_id`（relationshipId）、`created_by_user_id`（currentUser）、`updated_at`。
- 创建时 MUST 写入：`created_at`。
- `is_deleted` 创建时 MUST 为 false。

#### Scenario: Create gift
- **WHEN** 当前用户提交合法的 title/rarity/recipient
- **THEN** 创建 GiftDefinition 并返回 `{ ok:true, gift:{ id,... } }`
