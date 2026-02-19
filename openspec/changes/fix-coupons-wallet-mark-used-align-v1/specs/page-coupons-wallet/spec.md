## MODIFIED Requirements

### Requirement: Mark-used action button label alignment
券包页中“标记为已使用”操作按钮文案 MUST 在按钮容器内垂直居中显示。

- 页面 MUST 在 `.coupon-actions` 作用域内保证“标记为已使用”按钮文案垂直居中。
- 页面 MUST 使用局部样式覆盖，不得影响其他页面按钮布局。

#### Scenario: Render mark-used button label vertically centered
- **GIVEN** 用户进入券包页并看到可用券分组的“标记为已使用”按钮
- **WHEN** 页面渲染按钮
- **THEN** 按钮文案在按钮容器内垂直居中显示
- **AND** 其他页面按钮样式不受该变更影响
