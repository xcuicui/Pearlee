## ADDED Requirements

### Requirement: List GiftDefinitions in space
云函数 `gift_definitions_list` MUST 返回关系空间内的礼物定义列表，并支持按视图过滤。

#### Input
- `view` (required):
  - `toMe`: `recipient_user_id = currentUser`
  - `sentByMe`: `created_by_user_id = currentUser AND recipient_user_id = partnerUser`
- `includeInactive` (optional, default false)

#### Output
- 返回 GiftDefinition 列表，且 MUST 排除 `is_deleted = true`。

#### Scenario: List gifts for me
- **WHEN** 我调用 `gift_definitions_list({ view: "toMe" })`
- **THEN** 返回仅包含 recipient 为我的礼物
