## MODIFIED Requirements

### Requirement: Lottery page SHALL provide points help entry near assets rule
抽奖页 MUST 在资产规则文案区域提供说明入口，且入口文案来自统一“贝壳说明文案模块”，用户可从该入口进入说明页查看规则。

#### Scenario: Render help entry on lottery page
- **WHEN** 用户进入抽奖页（`/pages/lottery/index`）
- **THEN** 页面展示资产规则文案
- **AND** 在同一信息区块展示可点击说明入口

#### Scenario: Navigate to points help page
- **WHEN** 用户点击抽奖页中的说明入口
- **THEN** 页面跳转到 `/pages/lottery/points-help/index`
