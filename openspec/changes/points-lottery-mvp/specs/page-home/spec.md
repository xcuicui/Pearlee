# Change Spec Delta: page-home (points-lottery-mvp)

## ADDED Requirements

### Requirement: Home check-in pill
首页 MUST 提供一个轻量的「想念打卡」入口，不破坏现有关系标题/周历/情绪卡片/FAB 布局。

#### Scenario: Not checked in today
- **GIVEN** 用户今天尚未打卡
- **WHEN** 渲染首页
- **THEN** 首页在周历附近展示一个小 pill 按钮文案「想念打卡」

#### Scenario: Checked in today
- **GIVEN** 用户今天已打卡
- **WHEN** 渲染首页
- **THEN** pill 按钮文案显示为「今天已想你」且不可重复触发

#### Scenario: Check-in success
- **GIVEN** 用户今天尚未打卡
- **WHEN** 用户点击「想念打卡」
- **THEN** 页面调用 `checkin()`
- **AND** 成功后提示 toast：`今天的想念已收纳 +3 贝壳`
- **AND** 页面刷新并展示最新贝壳/抽奖券余额（best-effort）
