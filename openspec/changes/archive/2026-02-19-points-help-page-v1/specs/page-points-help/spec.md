## ADDED Requirements

### Requirement: Points help page SHALL be routable and static
系统 MUST 提供贝壳说明页路由，且页面为轻量静态内容页，无网络请求依赖。

#### Scenario: Access points help route
- **WHEN** 用户访问 `/pages/lottery/points-help/index`
- **THEN** 页面可正常渲染
- **AND** 导航栏标题显示“贝壳说明”（或同义文案）

### Requirement: Points help page SHALL explain sources and consumption
贝壳说明页 MUST 解释贝壳来源和贝壳消耗规则，文案清晰、简短。

#### Scenario: Explain points sources
- **WHEN** 页面渲染“贝壳从哪里来”段落
- **THEN** 显示来源示例（如打卡获得、完成任务获得）

#### Scenario: Explain points consumption
- **WHEN** 页面渲染“贝壳怎么用”段落
- **THEN** 显示消耗规则示例（如抽一次消耗 1 枚贝壳）
- **AND** 包含“贝壳兑换券并打开礼物”等用途说明
