# Spec: naming-system-v1

## Purpose
建立贝忆 Pearlee 的命名系统（Tone + Key 管理 + 日期/昵称规则），并将其落地到首页与记录页等核心触点：统一为“温柔陪伴 / 想念收纳处”的叙事，避免工具化。

## Requirements
### Requirement: Centralized strings keys
客户端所有用户可见文案 MUST 由统一 strings 常量层以 Key 管理，不允许在页面中散落硬编码中文。

#### Scenario: No hard-coded UI strings
- **WHEN** 检查首页/发布页/日详情/设置页的 UI 文案
- **THEN** 文案来自 strings key

### Requirement: Date formatting utility
日期标题格式 MUST 统一为 `M月D日`，并由 util 提供。

#### Scenario: Format today title
- **GIVEN** 今天日期
- **WHEN** 渲染标题
- **THEN** 显示如“2月17日"

### Requirement: Nickname fallback
昵称显示 MUST 遵循 fallback：优先用户自定义昵称；缺失时我=“我”，对方=“TA”。

#### Scenario: Fallback works
- **GIVEN** 未设置昵称
- **WHEN** 渲染相关文案
- **THEN** 我显示“我”，对方显示“TA"
