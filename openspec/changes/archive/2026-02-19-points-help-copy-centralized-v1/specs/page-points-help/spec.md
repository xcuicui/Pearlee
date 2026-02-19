## MODIFIED Requirements

### Requirement: Points help page SHALL explain sources and consumption
贝壳说明页 MUST 以更具体文案解释“来源、消耗路径、规则提示”，并由统一文案模块驱动渲染。

#### Scenario: Explain points sources with concrete actions
- **WHEN** 页面渲染“贝壳从哪里来”段落
- **THEN** MUST 包含“想念打卡可获得贝壳”
- **AND** MUST 包含“发布碎碎念可获得贝壳”
- **AND** MAY 包含“完成任务可获得贝壳”等补充来源

#### Scenario: Explain points consumption path
- **WHEN** 页面渲染“贝壳怎么用”段落
- **THEN** MUST 包含“抽一次小礼物消耗 1 枚贝壳”
- **AND** MUST 说明“获得小礼物券并可在券包查看”
- **AND** MUST 说明“可继续打开礼物”

#### Scenario: Explain usage boundary clearly
- **WHEN** 页面渲染“温馨提示”段落
- **THEN** MUST 明确仅用于应用内互动体验
- **AND** MUST 明确不支持提现或转赠等站外流转
