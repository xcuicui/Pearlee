# Change Spec Delta: page-relationship-create (naming-system-v1)

## ADDED Requirements

### Requirement: Relationship page copy uses naming system
创建关系页 MUST 使用统一 strings key 管理文案，并遵循温柔克制语气。

#### Scenario: No hard-coded copy
- **WHEN** 渲染创建关系页
- **THEN** 页面关键文案来自 strings key
- **AND** 避免工具/任务化措辞（如“发布/取消/完成任务”）
