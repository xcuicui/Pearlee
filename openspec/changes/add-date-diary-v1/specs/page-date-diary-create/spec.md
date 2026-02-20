## ADDED Requirements

### Requirement: Date diary composer
客户端 MUST 提供独立的「约会日记」发布页，用于创建图文约会日记。

#### Scenario: Open diary composer
- **WHEN** 用户从首页入口或清单项详情进入约会日记发布页
- **THEN** 页面可渲染输入框、图片入口、发生时间入口与主按钮

### Requirement: Default requires plan association
约会日记发布流程 MUST 默认要求关联一个约会清单项。

#### Scenario: Choose plan before writing
- **GIVEN** 用户从首页“约会日记”入口进入
- **WHEN** 进入发布流程
- **THEN** 页面 MUST 引导用户选择一个清单项作为关联（planId）后再提交

### Requirement: Temporary diary allowed
系统 MUST 支持「临时约会」兜底：允许不关联清单项也能提交约会日记。

#### Scenario: Submit without planId
- **GIVEN** 用户明确选择“临时约会（不进清单）”
- **WHEN** 用户提交约会日记
- **THEN** 页面调用 `date_diary_create({ planId: '', occurAt, text, images })` 并成功创建

### Requirement: Occur time editable
约会日记 MUST 支持编辑“约会发生时间”（occurAt），默认值为当前时间。

#### Scenario: Default occurAt is now
- **WHEN** 页面首次渲染
- **THEN** occurAt 默认等于当前时间（本地时区）

#### Scenario: User edits occurAt
- **WHEN** 用户修改发生时间并提交
- **THEN** 提交的 occurAt 为用户选择的时间

### Requirement: Text or images required
页面 MUST 在提交前校验：至少有文字或图片。

#### Scenario: Empty blocked
- **GIVEN** trim(text) 为空且未选择图片
- **WHEN** 用户尝试提交
- **THEN** 阻止提交并提示

### Requirement: Image limit 3
页面 MUST 限制图片最多 3 张。

#### Scenario: Over limit blocked
- **GIVEN** 已选 3 张图片
- **WHEN** 用户继续选择图片
- **THEN** 提示达到上限并不再添加
