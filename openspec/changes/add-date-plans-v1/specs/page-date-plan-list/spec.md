## ADDED Requirements

### Requirement: Date Plan List (open/done)
客户端 MUST 提供「约会清单」列表页，按未完成(open)与已完成(done)分组展示，并支持创建清单项。

#### Scenario: View open plans
- **GIVEN** 用户已加入未封存关系
- **WHEN** 用户进入约会清单页
- **THEN** 页面调用 `date_plan_list({ status: 'open' })` 并展示清单项列表

#### Scenario: View done plans
- **GIVEN** 用户已加入未封存关系
- **WHEN** 用户切换到已完成分组
- **THEN** 页面调用 `date_plan_list({ status: 'done' })` 并展示已完成清单项列表

### Requirement: Create date plan
页面 MUST 提供创建入口以新增清单项（至少包含标题）。

#### Scenario: Create success
- **GIVEN** 用户输入标题
- **WHEN** 用户提交创建
- **THEN** 页面调用 `date_plan_create({ title, notes? })`
- **AND** 成功后清单列表刷新，新的清单项出现在 open 列表
