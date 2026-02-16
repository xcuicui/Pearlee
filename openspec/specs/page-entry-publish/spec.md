# Spec: page-entry-publish

## Purpose
定义发布页文本输入、发布提交和取消行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Text Validation
页面 MUST 允许纯图片发布，但禁止全空。

#### Scenario: Empty content blocked
- **GIVEN** 文本为空且未选图
- **WHEN** 点击发布
- **THEN** 阻止提交并提示

### Requirement: Entry Publish
页面 MUST 在校验通过时创建 entry 并返回上一页。

#### Scenario: Publish success
- **GIVEN** 输入文本有效
- **WHEN** 用户点击发布
- **THEN** 页面调用 `entry_create({ text })`，提示成功并返回上一页

### Requirement: Cancel Publish
页面 MUST 支持取消并返回。

#### Scenario: Cancel
- **GIVEN** 用户在发布页
- **WHEN** 点击取消
- **THEN** 页面返回上一页

### Requirement: Image Limit 3
页面 MUST 限制图片最多 3 张。

#### Scenario: Max images
- **GIVEN** 已选 3 张
- **WHEN** 继续选择
- **THEN** 提示“最多 3 张图片”

### Requirement: Image Compression
页面 MUST 在上传前按规则压缩图片。

#### Scenario: Compress before upload
- **WHEN** 上传前处理
- **THEN** 宽 1080px、JPEG 0.75、不裁剪

## Data Contracts
### Client State
- `text: string`
- `error: string`

### Upstream Function Contract
- `entry_create({ text: string }): { ok: true, id: string }`
