# Change Spec Delta: page-home (naming-system-v1)

## ADDED Requirements

### Requirement: Emotion card source copy uses murmur tone
首页情绪卡片 MUST 展示温柔陪伴的来源提示，使用“碎碎念”语境。

#### Scenario: Emotion from partner
- **GIVEN** 情绪卡片内容来自对方（partner）
- **WHEN** 渲染情绪卡片
- **THEN** 展示文案：`来自 {TaNickname} 的碎碎念`

#### Scenario: Emotion from me
- **GIVEN** 情绪卡片内容来自我（me）
- **WHEN** 渲染情绪卡片
- **THEN** 展示文案：`我写给 {TaNickname} 的碎碎念`

### Requirement: FAB naming (accessibility)
首页右下角入口（FAB）MUST 具有入口名称“想你的碎碎念”（允许 UI 不显示文字，但需作为 aria/辅助文案）。

#### Scenario: FAB has murmur entry name
- **WHEN** 渲染首页
- **THEN** FAB 的辅助文案/aria-label 为“想你的碎碎念"

### Requirement: FAB bubble hint
首页 FAB 附近 MUST 出现一个轻量气泡暗示，文案为“想你的碎碎念”。

#### Scenario: Bubble hint visible
- **WHEN** 渲染首页
- **THEN** FAB 附近展示气泡暗示文案“想你的碎碎念”
- **AND** 气泡不应引入额外解释性长文案