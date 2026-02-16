## MODIFIED Requirements
### Requirement: Context Loading
函数 MUST 返回关系上下文，并包含关系级昵称（已做 fallback），且不返回/不依赖“TA”占位符。

#### Scenario: Relationship context includes nicknames
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `ctx_get`
- **THEN** 返回 `me.nickname` 与 `partner.nickname`
- **AND** 若 member 昵称为空，则按展示策略回退为“你/对方”
