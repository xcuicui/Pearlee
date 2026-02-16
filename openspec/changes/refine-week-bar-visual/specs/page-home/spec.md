## MODIFIED Requirements
### Requirement: Week Bar Rendering
首页 MUST 展示周历条（周一开始 7 天）并表达三种状态：有记录、今日、今日+有记录。

#### Scenario: Looks like a week strip, not a calendar grid
- **GIVEN** 首页周历条
- **WHEN** 渲染 7 天
- **THEN** 视觉上更接近“时间条/刻度条”（week strip），避免明显格子/表格感
- **AND** 每天信息密度克制：仅周几、日期数字、状态标记

#### Scenario: Has record
- **GIVEN** `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 该日展示底部圆点

#### Scenario: Today
- **GIVEN** `date === week.todayKey`
- **WHEN** 渲染周历
- **THEN** 该日展示克制的 ring（细描边或淡底圆）

#### Scenario: Today + record
- **GIVEN** `date === week.todayKey` 且 `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 同时展示 ring 与圆点

#### Scenario: level=2 stronger than level=1
- **GIVEN** `week.levelByDate[date] = 2`
- **WHEN** 渲染该日状态
- **THEN** 圆点视觉权重高于 level=1（更实/更大/双点均可）
- **AND** 不使用重阴影或高饱和色块
