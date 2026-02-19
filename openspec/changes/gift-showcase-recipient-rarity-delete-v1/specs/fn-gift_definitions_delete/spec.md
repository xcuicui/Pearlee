## ADDED Requirements

### Requirement: Soft delete GiftDefinition
云函数 `gift_definitions_delete` MUST 允许创建者将礼物“移出橱窗”（软删除）。

#### Input
- `id` (required)

#### Authorization
- 仅当 GiftDefinition 的 `created_by_user_id == currentUser` 时允许删除；否则 MUST 返回 FORBIDDEN。

#### Behavior
- MUST 设置：`is_deleted=true` 与 `deleted_at=now()`，并更新 `updated_at`。

#### Scenario: Confirm then delete
- **GIVEN** 当前用户为礼物创建者
- **WHEN** 调用 `gift_definitions_delete({ id })`
- **THEN** 该礼物在后续 `gift_definitions_list` 与抽取池中不可见
