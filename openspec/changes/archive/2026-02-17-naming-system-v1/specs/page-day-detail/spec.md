# Change Spec Delta: page-day-detail (naming-system-v1)

## ADDED Requirements

### Requirement: Comment composer tone
日详情页评论区输入与按钮文案 MUST 使用温柔克制语气，避免工具化“发送”。

#### Scenario: Comment composer labels
- **WHEN** 渲染评论输入区
- **THEN** placeholder 使用温柔语气（由 strings key 提供）
- **AND** 提交按钮不使用“发送”（由 strings key 提供）