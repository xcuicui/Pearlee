## ADDED Requirements

### Requirement: Mixed timeline groups by date
时间线页 MUST 将碎碎念与约会日记按时间混排，并按日期分组渲染。

#### Scenario: Render mixed items
- **GIVEN** 时间线接口返回包含 `type='murmur'` 与 `type='dateDiary'` 的 items
- **WHEN** 页面渲染
- **THEN** 按 `date` 分组展示
- **AND** 每个分组内按时间排序展示（排序规则一致且稳定）

### Requirement: Date diary card rendering
当 item.type 为 `dateDiary` 时，页面 MUST 以“约会日记”卡片样式渲染，并展示发生时间（occurAt）与关联清单标题（若存在）。

#### Scenario: Date diary shows occur time
- **GIVEN** item.type = 'dateDiary' 且 item.occurAt 存在
- **WHEN** 渲染该条目
- **THEN** 卡片展示 occurAt 对应的时间信息（本地时区）

#### Scenario: Date diary shows plan title
- **GIVEN** item.type = 'dateDiary' 且 item.planTitle 存在
- **WHEN** 渲染该条目
- **THEN** 卡片展示关联清单标题
