## MODIFIED Requirements
### Requirement: Relationship Context Query
函数 MUST 查询当前 OPENID 对应的未封存关系，并返回关系基本信息；同时返回关系级昵称（已做 fallback）。

#### Scenario: Relationship exists
- **GIVEN** OPENID 属于未封存关系
- **WHEN** 调用 `ctx_get`
- **THEN** 返回关系基本信息（id/name/startDate/inviteCode/memberOpenids）
- **AND** 返回 `relationship.me.nickname` 与 `relationship.partner.nickname`
- **AND** 若 member 昵称为空，则按展示策略回退为“你/对方”

#### Scenario: Relationship missing
- **GIVEN** OPENID 不在任何未封存关系中
- **WHEN** 调用 `ctx_get`
- **THEN** 返回 `relationship: null`
