# Change Spec Delta: page-entry-publish (naming-system-v1)

## ADDED Requirements

### Requirement: Murmur space naming
发布页 MUST 体现“碎碎念收纳处”的空间命名体系。

#### Scenario: Subtitle shows murmur box name
- **WHEN** 渲染发布页
- **THEN** 页面在标题下方展示副标题：`{MyNickname} 的碎碎念收纳处`

### Requirement: Murmur hint line
发布页 MUST 展示一行克制提示语（非说明书）。

#### Scenario: Hint line copy
- **WHEN** 渲染发布页
- **THEN** 展示提示语：`把想到你的那一刻，放进这里。`

### Requirement: Composer placeholder
输入框 placeholder MUST 固定为：`想到你时的碎碎念…`

#### Scenario: Placeholder
- **WHEN** 渲染输入框
- **THEN** placeholder 为“想到你时的碎碎念…”

### Requirement: Add photo entry copy
图片入口文案 MUST 为：`+ 添一张照片`。

#### Scenario: Add photo label
- **WHEN** 渲染图片入口
- **THEN** 显示“+ 添一张照片”

### Requirement: Submit button naming
主按钮文案 MUST 为“收好”（不使用“发布”）。

#### Scenario: Submit label
- **WHEN** 渲染主按钮
- **THEN** 文案为“收好"