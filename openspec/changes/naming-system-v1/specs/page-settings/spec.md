# Change Spec Delta: page-settings (naming-system-v1)

## ADDED Requirements

### Requirement: Settings copy tone
设置页关键文案 MUST 去工具化并保持温柔克制语气（仅替换文字，不改功能结构）。

#### Scenario: Copy uses naming system
- **WHEN** 渲染设置页
- **THEN** “邀请对方/复制邀请码/加入关系/解除关系”等文案来自统一 strings key
- **AND** 避免任务化/工具化措辞（如“任务/完成/发布/取消”）