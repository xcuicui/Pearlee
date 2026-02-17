# Change Spec Delta: page-entry-publish (murmur-composer-v2)

## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Cancel Publish
页面 MUST 支持取消并返回。

#### Scenario: Cancel
- **GIVEN** 用户在发布页
- **WHEN** 点击取消
- **THEN** 页面返回上一页
