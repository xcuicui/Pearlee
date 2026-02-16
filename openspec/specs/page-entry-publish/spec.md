# Spec: page-entry-publish (v1.3)

## Purpose
定义发布页：文本输入、图片上传（最多 3，压缩规则）、发布提交与取消行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。

## Requirements
### Requirement: Content Validation
页面 MUST 支持轻量记录：允许“纯图片”，但不允许全空。

#### Scenario: Empty content blocked
- **GIVEN** 文本为空或仅空白，且未选择图片
- **WHEN** 用户点击发布
- **THEN** 页面提示“写点什么吧。”（或等价文案）并阻止提交

### Requirement: Image Picker
页面 MUST 支持选择图片并限制最多 3 张。

#### Scenario: Max images
- **GIVEN** 已选择 3 张图片
- **WHEN** 用户继续选择
- **THEN** 页面提示“最多 3 张图片”并阻止继续添加

### Requirement: Image Compression Rules
页面 MUST 在上传前对图片进行压缩处理：
- 单张最大 5MB（超过则提示并阻止）
- 压缩到 1080px 宽
- JPEG 质量 0.75
- 不支持裁剪

> 允许实现上使用微信能力或自有压缩逻辑；验收以输出效果与性能为主。

### Requirement: Upload and Persist
页面 MUST 将图片上传并以结构化数组写入 Entry.images。

#### Scenario: Publish success
- **GIVEN** 文本有效或图片非空
- **WHEN** 用户点击发布
- **THEN** 页面上传图片并得到 `{ url, width, height }[]`
- **AND** 调用 `entry_create({ text, images })`
- **AND** 提示成功并返回上一页

### Requirement: Cancel Publish
#### Scenario: Cancel
- **GIVEN** 用户在发布页
- **WHEN** 点击取消
- **THEN** 页面返回上一页

## Data Contracts
### Client State
- `text: string`
- `images: Array<{ localPath: string, width?: number, height?: number, size?: number }>`
- `error: string`

### Upstream Function Contract
- `entry_create({ text?: string, images?: Array<{ url: string, width: number, height: number }> }): { ok: true, id: string }`
