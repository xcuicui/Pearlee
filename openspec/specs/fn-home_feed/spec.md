# Spec: fn-home_feed (v1.3)

## Purpose
定义首页（周历）聚合数据接口：关系信息（含关系昵称）、周历活跃标记、情绪卡片优先级、今日状态与连续天数（streak）。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。

## Requirements
### Requirement: Relationship Context Fallback
函数 MUST 在用户无关系时返回空关系标识供前端重定向。

#### Scenario: No relationship
- **GIVEN** OPENID 不属于未封存关系
- **WHEN** 调用 `home_feed`
- **THEN** 返回 `{ ok: true, relationshipId: '' }`

### Requirement: Week Range
函数 MUST 以「周一」为一周起点返回 7 天范围，并支持指定 `weekStart`。

#### Scenario: Default current week
- **GIVEN** 未传入 `weekStart`
- **WHEN** 调用 `home_feed()`
- **THEN** 返回的 `week.start` 为当前周周一（YYYY-MM-DD）
- **AND** `week.days.length = 7`

#### Scenario: Custom weekStart
- **GIVEN** 传入 `weekStart=YYYY-MM-DD`
- **WHEN** 调用 `home_feed({ weekStart })`
- **THEN** `week.start = weekStart`
- **AND** `week.days` 为从 `weekStart` 起连续 7 天

### Requirement: Week Activity Marks
函数 MUST 查询当前关系在 `week.start..week.end` 内是否有记录，并返回日期维度的活跃标记。

#### Scenario: Day has any entry
- **GIVEN** 当周某日（date）关系内任意成员存在 ≥1 条 Entry
- **WHEN** 调用 `home_feed`
- **THEN** `week.activeDates` 包含该 `date`

#### Scenario: Day has both members entries (optional level)
- **GIVEN** 当周某日双方均存在 ≥1 条 Entry
- **WHEN** 调用 `home_feed`
- **THEN** `week.levelByDate[date] = 2`

#### Scenario: Day has single member entries
- **GIVEN** 当周某日仅一方存在 ≥1 条 Entry
- **WHEN** 调用 `home_feed`
- **THEN** `week.levelByDate[date] = 1`

### Requirement: Today Summary
函数 MUST 返回当天 key 与是否已记录。

#### Scenario: Today has any entry
- **GIVEN** 今天（todayKey）在当周范围内且存在 ≥1 条 Entry
- **WHEN** 调用 `home_feed`
- **THEN** `today.hasAny = true`

### Requirement: Emotion Priority (Now first)
函数 MUST 按「现在优先」的 MVP 优先级返回情绪卡片。

#### Scenario: Partner recent entry exists
- **GIVEN** 对方近 3 天内存在记录
- **WHEN** 选择情绪卡片
- **THEN** 返回对方近 3 天内最新一条
- **AND** `emotion.from = 'TA'`

#### Scenario: Partner recent entry missing but history exists
- **GIVEN** 对方近 3 天无记录，但关系存在历史记录
- **WHEN** 选择情绪卡片
- **THEN** 从历史池随机回退 1 条
- **AND** 回退池 MUST 排除最近 3 天内的所有记录（双方都排除）

#### Scenario: No history
- **GIVEN** 关系内无任何历史记录
- **WHEN** 选择情绪卡片
- **THEN** 返回 `{ empty: true }`

### Requirement: Streak (RelationshipStats)
函数 MUST 返回关系连续天数（current_streak），用于首页展示。

#### Scenario: Streak visible only when >= 2
- **GIVEN** `streak.current >= 2`
- **WHEN** 返回结果
- **THEN** `streak.visible = true`

- **GIVEN** `streak.current < 2`
- **WHEN** 返回结果
- **THEN** `streak.visible = false`

> 计算逻辑要求：连续规则为「任意一方每日 ≥1 条记录」；推荐在写入时更新 stats，但本函数只消费结果。

## Data Contracts
### Input
- `weekStart?: string`（YYYY-MM-DD；表示周一）

### Output
- Success (no relationship): `{ ok: true, relationshipId: '' }`
- Success (has relationship):
  - `ok: true`
  - `relationshipId: string`
  - `startDate: string (YYYY-MM-DD or empty)`
  - `nickname: string`（关系内昵称，用于“和 {nickname} 的第 X 天”）
  - `daysSinceStart: number`
  - `streak: { current: number, visible: boolean, lastRecordDate?: string }`
  - `week: {
      start: string,
      end: string,
      activeDates: string[],              // dates with any entry
      levelByDate?: Record<string, 1|2>,  // optional; for stronger mark when both sides recorded
      todayKey: string
    }`
  - `emotion: {
      empty: boolean,
      entryId?: string,
      date?: string,
      timeText?: string,
      text?: string,
      from?: 'TA' | '你',
      nickname?: string,
      coverImage?: string
    }`
    - `coverImage`: 封面图 URL（优先为 `https://...` 临时链接；失败时回退为 `cloud://...` fileID）
  - `today: { key: string, hasAny: boolean }`
