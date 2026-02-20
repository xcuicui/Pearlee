## MODIFIED Requirements

### Requirement: Date diary composer
客户端 MUST 将「约会日记」页面重构为“回忆页”结构，页面标题与文案 MUST 使用温柔克制语气，避免表单化。

#### Scenario: Page structure order
- **WHEN** 渲染页面
- **THEN** 页面按顺序展示：标题区 → 日期强化区 → 图片区域 → 文本区域 → 关联清单（降级）
- **AND** 底部存在浮动 CTA（不占据整页）

#### Scenario: Copy replacement rules
- **WHEN** 页面渲染
- **THEN** 页面文案遵守：
  - “约会日记” → “这一天的回忆”
  - “收好” → “把这一天留下”
  - 删除“把这次约会收进这里”等工具化提示

### Requirement: Header copy
页面 MUST 在顶部展示标题与副标题。

#### Scenario: Header shows memory tone
- **WHEN** 渲染页面顶部
- **THEN** 展示标题：`这一天的回忆`
- **AND** 展示副标题：`和 {对方昵称} 的一次约会`
- **AND** 对方昵称获取为 best-effort（ctx_get 失败时 fallback 为“对方”）

### Requirement: Date emphasis block
页面 MUST 展示日期强化区（书页感增强，但克制）。

#### Scenario: Meta line
- **WHEN** 渲染日期强化区
- **THEN** 展示小字：`YYYY.MM.DD · 周X · HH:MM`
- **AND** 用户可以编辑发生日期/时间（交互样式不表单化）

### Requirement: Media section priority
图片区域 MUST 优先展示在文字上方，并遵守展示规则。

#### Scenario: No images
- **GIVEN** images 为空
- **WHEN** 渲染图片区域
- **THEN** 展示轻按钮：`+ 加一张那天的照片`

#### Scenario: Single image
- **GIVEN** images.length === 1
- **WHEN** 渲染图片区域
- **THEN** 以 16:9 圆角大图展示

#### Scenario: Multiple images
- **GIVEN** images.length > 1
- **WHEN** 渲染图片区域
- **THEN** 使用网格展示（复用现有缩略图规则）

### Requirement: Text section as paper
文本输入区域 MUST 更像纸张而非表单。

#### Scenario: Placeholder
- **WHEN** 渲染输入框
- **THEN** placeholder 为：`那天发生了什么？` 或 `这一刻最想记住什么？`

#### Scenario: No heavy form styling
- **WHEN** 渲染文本区域
- **THEN** 不使用重边框
- **AND** 不出现大面积纯灰背景

### Requirement: Plan association downgraded
关联清单 MUST 从顶部移到底部，并以 secondary 行展示。

#### Scenario: Association row
- **WHEN** 渲染关联清单区域
- **THEN** 展示：`关联到某个清单 >`
- **AND** 点击进入原选择逻辑（bottom sheet）

### Requirement: Floating CTA
页面 MUST 使用底部浮动 CTA，并使用仪式动作文案。

#### Scenario: CTA copy
- **WHEN** 渲染底部 CTA
- **THEN** 按钮文案为：`把这一天留下`

#### Scenario: CTA layout
- **WHEN** 渲染页面
- **THEN** CTA 固定在安全区内浮层，不占据整页空间
