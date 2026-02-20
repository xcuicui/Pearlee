## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Home writing entry hub (three entries)
首页 MUST 在页面下方展示三个用于写内容的入口：约会清单 / 约会日记 / 碎碎念。

#### Scenario: Three entries visible
- **WHEN** 渲染首页
- **THEN** 页面下方可见三个入口
- **AND** 分别指向约会清单、约会日记创建、碎碎念发布

#### Scenario: Navigate to date plan list
- **WHEN** 用户点击“约会清单”入口
- **THEN** 跳转到约会清单页（路由由实现定义）

#### Scenario: Navigate to date diary create
- **WHEN** 用户点击“约会日记”入口
- **THEN** 进入约会日记发布流程（默认要求选择关联清单项，允许临时约会兜底）

#### Scenario: Navigate to murmur publish
- **WHEN** 用户点击“碎碎念”入口
- **THEN** 进入碎碎念发布页 `/pages/entry/publish`
