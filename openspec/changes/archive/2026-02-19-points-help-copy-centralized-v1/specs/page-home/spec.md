## ADDED Requirements

### Requirement: Home check-in area SHALL provide shells tip entry
首页打卡操作区域 MUST 提供轻量“贝壳提示”文案，并可跳转贝壳说明页。

#### Scenario: Render check-in tip near action
- **WHEN** 用户进入首页
- **THEN** 在“想念打卡”附近展示轻提示文案（说明打卡可获得贝壳）
- **AND** 文案风格保持轻量，不干扰原有主操作

#### Scenario: Navigate from check-in tip to points help
- **WHEN** 用户点击该提示中的说明入口
- **THEN** 页面跳转到 `/pages/lottery/points-help/index`
