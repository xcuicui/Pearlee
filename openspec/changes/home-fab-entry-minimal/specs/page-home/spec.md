# Change Spec Delta: page-home (home-fab-entry-minimal)

## ADDED Requirements

### Requirement: Home Entry FAB (minimal)
首页 MUST 提供一个右下角固定悬浮 FAB 作为“记录入口”，且不改变首页其他结构。

#### Scenario: FAB always visible
- **WHEN** 渲染首页
- **THEN** 页面右下角存在一个圆形 FAB（仅图标，无文字）
- **AND** FAB 不依赖 `today.hasAny`（永远存在）

#### Scenario: FAB navigates to publish
- **WHEN** 用户点击 FAB
- **THEN** 进入现有发布页 `/pages/entry/publish`

#### Scenario: No today status card
- **WHEN** 渲染首页
- **THEN** 页面不再出现原“今天还没有留下记录/今天已被点亮”状态卡片
- **AND** 页面不再出现按钮“记录这一刻”

#### Scenario: FAB does not block content or tabbar
- **WHEN** 渲染首页
- **THEN** 页面容器底部预留至少 96px 的 padding，避免 FAB 遮挡内容或 tabbar

## Non-Goals (enforced)
- 不改时间区/周历/情绪卡片
- 不改接口/数据结构/导航栏
- 不新增任何轻提示文案
