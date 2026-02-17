# Spec: fn-home_feed

## Purpose
定义首页聚合数据接口：关系信息、情绪卡片优先级、月历点亮与今日状态的可验收规则，并给出返回结构与字段语义。
## Requirements
### Requirement: Relationship Context Fallback
函数 MUST 在用户无关系时返回空关系标识供前端重定向。

#### Scenario: No relationship
- **GIVEN** OPENID 不属于未封存关系
- **WHEN** 调用 `home_feed`
- **THEN** 返回 `{ ok: true, relationshipId: '' }`

### Requirement: Month Marks Aggregation
函数 MUST 在 v1.3 中不再按月返回 marks；改为按周返回 week 数据（周一开始 7 天）。

#### Scenario: Deprecated month marks
- **GIVEN** v1.3 首页为周历
- **WHEN** 调用 `home_feed`
- **THEN** 响应不再以 `year/month -> marks` 作为主数据来源

### Requirement: Emotion Priority
函数 MUST 按 MVP 优先级返回情绪卡片，并保持文本字段来源稳定。

#### Scenario: Partner recent entry exists
- **GIVEN** 对方 3 天内有记录
- **WHEN** 选择情绪卡片
- **THEN** 返回该记录并标记来源 `TA`
- **AND** `emotion.text` 使用 entry 的文本内容（`contentText`）

#### Scenario: Partner recent entry missing
- **GIVEN** 对方 3 天内无记录但关系有历史记录
- **WHEN** 选择情绪卡片
- **THEN** 从最近样本中随机回退 1 条返回
- **AND** `emotion.text` 使用 entry 的文本内容（`contentText`）

### Requirement: Today Summary
函数 MUST 返回当天 key 与当月查询结果中的今日发布态。

#### Scenario: Today has entry in current query month
- **GIVEN** 本次请求月份包含今天且该天有记录
- **WHEN** 返回结果
- **THEN** `today.hasAny = true`

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
情绪卡片来源字段 MUST 使用 relationship nickname（或 fallback 的“对方/你”），不得出现“TA”。

#### Scenario: Emotion from partner
- **GIVEN** 选中对方记录作为情绪卡片
- **WHEN** 返回 emotion
- **THEN** emotion.from 为 partnerNickname（或“对方”）

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

### Requirement: Relationship Nicknames In Home Feed
home_feed MUST 返回关系级昵称（已做 fallback）用于统一展示，且不再返回硬编码“TA”。

#### Scenario: Provide my/partner nicknames
- **GIVEN** OPENID 属于关系
- **WHEN** 调用 `home_feed`
- **THEN** 返回 `myNickname` 与 `partnerNickname`
- **AND** 若 member 昵称为空，则按展示策略回退（我的为“你”，对方为“对方”）

### Requirement: Emotion Contract Compatibility
函数 MUST 不因 entry 图片字段而改变情绪卡片结构。

#### Scenario: Entry has images
- **GIVEN** 被选中的 entry 含有 `images`
- **WHEN** 返回 `home_feed`
- **THEN** `emotion` 字段结构保持不变，不新增图片字段

## Data Contracts
### Input
- `year?: number`
- `month?: number`（1-12）

### Output
- Success (no relationship): `{ ok: true, relationshipId: '' }`
- Success (has relationship):
  - `ok: true`
  - `relationshipId: string`
  - `relationshipName: string`
  - `startDate: string`
  - `marks: Record<YYYY-MM-DD, { level: 1 | 2 }>`
  - `emotion: { empty: boolean, entryId?: string, date?: string, timeText?: string, text?: string, from?: 'TA' | '你', images?: string[], coverImage?: string }`
    - `coverImage`: 情绪卡片封面图 URL（优先为 `https://...` 临时链接；失败时回退为 `cloud://...` fileID）
  - `today: { key: string, hasAny: boolean }`
