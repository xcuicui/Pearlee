## ADDED Requirements
### Requirement: Relationship Nicknames In Home Feed
home_feed MUST 返回关系级昵称（已做 fallback）用于统一展示，且不再返回硬编码“TA”。

#### Scenario: Provide my/partner nicknames
- **GIVEN** OPENID 属于关系
- **WHEN** 调用 `home_feed`
- **THEN** 返回 `myNickname` 与 `partnerNickname`
- **AND** 若 member 昵称为空，则按展示策略回退（我的为“你”，对方为“对方”）

## MODIFIED Requirements
### Requirement: Emotion Priority (Now first)
情绪卡片来源字段 MUST 使用 relationship nickname（或 fallback 的“对方/你”），不得出现“TA”。

#### Scenario: Emotion from partner
- **GIVEN** 选中对方记录作为情绪卡片
- **WHEN** 返回 emotion
- **THEN** emotion.from 为 partnerNickname（或“对方”）
