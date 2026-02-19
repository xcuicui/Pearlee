## ADDED Requirements

### Requirement: Entry publish page SHALL provide shells tip entry
发布页 MUST 在提交相关区域提供轻量“贝壳提示”文案，并可跳转贝壳说明页。

#### Scenario: Render publish tip near submit
- **WHEN** 用户进入发布页
- **THEN** 在提交按钮附近或页面上方展示轻提示文案（说明发布碎碎念可获得贝壳）
- **AND** 该提示不影响现有发布链路与主按钮行为

#### Scenario: Navigate from publish tip to points help
- **WHEN** 用户点击该提示中的说明入口
- **THEN** 页面跳转到 `/pages/lottery/points-help/index`
