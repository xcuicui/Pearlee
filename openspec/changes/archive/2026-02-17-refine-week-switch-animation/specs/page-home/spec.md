## ADDED Requirements
### Requirement: Week Switching Animation
首页周历条 MUST 提供丝滑的滑动切周动效（随手势平移过渡），并保持数据一致性。

#### Scenario: Swipe animates week strip
- **GIVEN** 首页周历条
- **WHEN** 用户左右滑动切换周
- **THEN** 周历条随手势平移并有过渡动画（非松手瞬切）
- **AND** 动画完成后调用 `home_feed({ weekStart })` 更新对应周数据

#### Scenario: Multiple swipes stable
- **GIVEN** 用户连续滑动多周
- **WHEN** 多次切换
- **THEN** 周起始日期与展示数据保持一致，不错位

### Requirement: Subtle Arrows (A)
首页周历条两侧 MUST 展示极淡小箭头作为滑动提示，且不使用“上周/下周”文字按钮。

#### Scenario: No text buttons
- **WHEN** 渲染首页周历条
- **THEN** 不出现“上周/下周”文字按钮
- **AND** 左右存在极淡小箭头（可点击或仅提示均可）
