## MODIFIED Requirements
### Requirement: Top Time Area
顶部标题 MUST 使用关系级昵称（对方昵称）。

#### Scenario: Title uses partner nickname
- **GIVEN** home_feed 返回 `partnerNickname`
- **WHEN** 渲染标题
- **THEN** 展示：`和 {partnerNickname} 的第 {X} 天`
- **AND** 若对方昵称为空，则使用 fallback “对方”

## ADDED Requirements
### Requirement: No TA Placeholder
首页所有用户可见文案 MUST 不再出现“TA”占位符。

#### Scenario: No TA in UI
- **WHEN** 渲染首页（含情绪空态/来源/CTA）
- **THEN** 不出现字符串“TA”
