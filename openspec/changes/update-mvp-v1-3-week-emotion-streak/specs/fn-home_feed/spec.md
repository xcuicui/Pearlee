## MODIFIED Requirements
### Requirement: Month Marks Aggregation
函数 MUST 在 v1.3 中不再按月返回 marks；改为按周返回 week 数据（周一开始 7 天）。

#### Scenario: Deprecated month marks
- **GIVEN** v1.3 首页为周历
- **WHEN** 调用 `home_feed`
- **THEN** 响应不再以 `year/month -> marks` 作为主数据来源

## ADDED Requirements
### Requirement: Week Range
函数 MUST 以周一为起点返回 7 天周范围，并支持指定 `weekStart`。

#### Scenario: Default current week
- **GIVEN** 未传入 `weekStart`
- **WHEN** 调用 `home_feed()`
- **THEN** 返回 `week.start` 为当前周周一（YYYY-MM-DD）
- **AND** `week.days.length = 7`

#### Scenario: Custom weekStart
- **GIVEN** 传入 `weekStart=YYYY-MM-DD`
- **WHEN** 调用 `home_feed({ weekStart })`
- **THEN** `week.start = weekStart`
- **AND** `week.days` 为从 `weekStart` 起连续 7 天

### Requirement: Week Activity Marks
函数 MUST 返回当周有记录的日期集合（任意一方 ≥1 条 entry 视为有记录）。

#### Scenario: Day has any entry
- **GIVEN** 当周某日存在 ≥1 条 Entry
- **WHEN** 调用 `home_feed`
- **THEN** `week.activeDates` 包含该日期

#### Scenario: Optional levelByDate
- **GIVEN** 某日双方均有记录
- **WHEN** 返回 `levelByDate`
- **THEN** `levelByDate[date] = 2`

### Requirement: Emotion Priority (Now first)
函数 MUST 优先展示对方近 3 天最新记录；否则随机历史（排除近 3 天）；否则空态。

#### Scenario: Partner recent entry exists
- **GIVEN** 对方近 3 天存在记录
- **WHEN** 选择情绪卡片
- **THEN** 返回对方近 3 天内最新一条
- **AND** `emotion.from = 'TA'`

#### Scenario: Partner recent missing, fallback to history
- **GIVEN** 对方近 3 天无记录但关系存在历史
- **WHEN** 选择情绪卡片
- **THEN** 从历史池随机回退 1 条
- **AND** 回退池 MUST 排除最近 3 天内的所有记录

#### Scenario: No history
- **GIVEN** 关系内无记录
- **WHEN** 选择情绪卡片
- **THEN** 返回 `{ empty: true }`

### Requirement: Streak Summary
函数 MUST 返回连续天数 streak（>=2 才展示）。

#### Scenario: Visible when >=2
- **GIVEN** `streak.current >= 2`
- **WHEN** 返回结果
- **THEN** `streak.visible = true`

#### Scenario: Hidden when <2
- **GIVEN** `streak.current < 2`
- **WHEN** 返回结果
- **THEN** `streak.visible = false`
