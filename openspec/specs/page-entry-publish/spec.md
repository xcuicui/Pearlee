# Spec: page-entry-publish

## Purpose
定义发布页文本输入、发布提交和取消行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Text Validation
页面 MUST 在提交前校验“至少有文字或图片”。

#### Scenario: Empty blocked when no images
- **GIVEN** trim(text) 为空且未选择图片
- **WHEN** 用户尝试提交
- **THEN** 阻止提交

### Requirement: Entry Publish
页面 MUST 在校验通过时上传已选图片并创建 entry 后返回上一页。

#### Scenario: Publish success with text or images
- **GIVEN** trim(text) 非空 或 选择了 1-9 张图片
- **WHEN** 用户点击主按钮“说完了”
- **THEN** 页面按既有流程上传图片（如有）并调用 `entry_create({ text, images })`
- **AND** 成功后提示并返回上一页

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

### Requirement: Murmur Tone & Title
页面 MUST 使用“碎碎念”语境，并将顶部标题设置为当日日期（例如“2月16日”）。

#### Scenario: Title is date
- **WHEN** 进入发布页
- **THEN** 页面标题为当日日期（M月D日格式）
- **AND** 不出现“发布/取消/写日记/留下些什么”等工具化标题文案

### Requirement: Primary action only
页面 MUST 仅保留一个主按钮，文案为“说完了”，且不提供“取消”按钮。

#### Scenario: No cancel button
- **WHEN** 渲染发布页
- **THEN** 页面不出现“取消”按钮
- **AND** 返回离开依赖左上角返回

#### Scenario: Primary button label
- **WHEN** 渲染发布页
- **THEN** 主按钮文案为“说完了”

### Requirement: Primary button enabled rule
主按钮 MUST 仅在 `trim(text).length > 0 OR images.length > 0` 时可点击。

#### Scenario: Disabled when empty
- **GIVEN** trim(text) 为空且 images 为空
- **WHEN** 渲染页面
- **THEN** 主按钮为 disabled（不可点击）

#### Scenario: Enabled when text present
- **GIVEN** trim(text) 非空
- **WHEN** 渲染页面
- **THEN** 主按钮可点击

#### Scenario: Enabled when images present
- **GIVEN** images.length > 0
- **WHEN** 渲染页面
- **THEN** 主按钮可点击

### Requirement: Image entry non-tool
图片入口 MUST 不展示工具计数“图片(0/9)”，改为“+ 添加照片”。

#### Scenario: Image entry label
- **WHEN** 渲染发布页
- **THEN** 展示“+ 添加照片”入口
- **AND** 不出现“图片（x/9）”或类似计数

### Requirement: Character count subtle
字数计数 MUST 默认隐藏，仅当剩余字数 <= 50 时显示“{current}/{max}”。

#### Scenario: Count hidden by default
- **GIVEN** remaining > 50
- **WHEN** 渲染页面
- **THEN** 不展示字数计数

#### Scenario: Count shown near limit
- **GIVEN** remaining <= 50
- **WHEN** 渲染页面
- **THEN** 展示“{current}/{max}”

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

## Data Contracts
### Client State
- `text: string`
- `error: string`

### Upstream Function Contract
- `entry_create({ text: string }): { ok: true, id: string }`
