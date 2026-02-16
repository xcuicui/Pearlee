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
函数 MUST 基于给定年月内 entries 按天聚合 marks。

#### Scenario: Single-side activity
- **GIVEN** 某天仅 1 个成员有记录
- **WHEN** 构建 marks
- **THEN** `marks[day].level = 1`

#### Scenario: Two-side activity
- **GIVEN** 某天 2 个成员均有记录
- **WHEN** 构建 marks
- **THEN** `marks[day].level = 2`

### Requirement: Emotion Priority
函数 MUST 按 MVP 优先级返回情绪卡片。

#### Scenario: Partner recent entry exists
- **GIVEN** 对方 3 天内有记录
- **WHEN** 选择情绪卡片
- **THEN** 返回该记录并标记来源 `TA`

#### Scenario: Partner recent entry missing
- **GIVEN** 对方 3 天内无记录但关系有历史记录
- **WHEN** 选择情绪卡片
- **THEN** 从最近样本中随机回退 1 条返回

### Requirement: Today Summary
函数 MUST 返回当天 key 与当月查询结果中的今日发布态。

#### Scenario: Today has entry in current query month
- **GIVEN** 本次请求月份包含今天且该天有记录
- **WHEN** 返回结果
- **THEN** `today.hasAny = true`

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
