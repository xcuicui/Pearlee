# Spec: page-entry-publish

## Purpose
定义发布页文本输入、发布提交和取消行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Text Validation
页面 MUST 在提交前校验文本非空。

#### Scenario: Empty text blocked
- **GIVEN** 输入文本为空或仅空白
- **WHEN** 用户点击发布
- **THEN** 页面显示“写点什么吧。”并阻止提交（无论是否已选图片）

### Requirement: Entry Publish
页面 MUST 在校验通过时上传已选图片并创建 entry 后返回上一页。

#### Scenario: Publish success without images
- **GIVEN** 输入文本有效且未选择图片
- **WHEN** 用户点击发布
- **THEN** 页面调用 `entry_create({ text, images: [] })`，提示成功并返回上一页

#### Scenario: Publish success with images
- **GIVEN** 输入文本有效且选择了 1-9 张图片
- **WHEN** 用户点击发布
- **THEN** 页面先调用 `wx.cloud.uploadFile` 上传所有图片并收集 `fileID`
- **AND** 页面调用 `entry_create({ text, images })`
- **AND** 页面提示成功并返回上一页

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

### Requirement: Image Selection Management
页面 MUST 支持图片的选择、预览与移除，并遵守图片数量上限。

#### Scenario: Select images
- **GIVEN** 当前已选图片少于上限
- **WHEN** 用户点击添加图片
- **THEN** 页面允许从相册/拍照选择并加入已选列表，累计不超过上限

#### Scenario: Select over limit blocked
- **GIVEN** 当前已选图片已达上限
- **WHEN** 用户尝试继续添加
- **THEN** 页面提示达到上限并不再添加

#### Scenario: Remove selected image
- **GIVEN** 已选列表存在图片
- **WHEN** 用户点击移除某张图片
- **THEN** 页面从已选列表删除该图片

## Data Contracts
### Client State
- `text: string`
- `error: string`

### Upstream Function Contract
- `entry_create({ text: string }): { ok: true, id: string }`
