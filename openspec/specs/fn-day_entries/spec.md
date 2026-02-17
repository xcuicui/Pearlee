# Spec: fn-day_entries

## Purpose
定义某天详情数据查询：entries + likes + comment 聚合结果。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Relationship and Date Validation
函数 MUST 要求调用者有关系且提供日期。

#### Scenario: No relationship
- **GIVEN** OPENID 无关系
- **WHEN** 调用 `day_entries`
- **THEN** 返回业务错误 `NO_REL`

#### Scenario: Missing date
- **GIVEN** `date` 缺失
- **WHEN** 调用 `day_entries`
- **THEN** 返回业务错误 `MISSING_DATE`

### Requirement: Day Entries Query
函数 MUST 查询指定日期、当前关系、未删除 entries，按时间升序。

#### Scenario: Query by date
- **GIVEN** 输入有效日期
- **WHEN** 调用 `day_entries({ date })`
- **THEN** 返回当日所有 entry 视图列表
- **AND** 每条 entry 视图包含 `images` 数组（最多 9 项，默认空数组）

### Requirement: Likes and Comment Aggregation
函数 MUST 聚合点赞数量、我的点赞态，以及单条评论视图。

#### Scenario: Aggregate interactions
- **GIVEN** 当天存在点赞和评论数据
- **WHEN** 返回列表
- **THEN** 每条 entry 包含 `likeCount`、`liked`、`comment|null`，且不影响 `images` 字段输出

## Data Contracts
### Input
- `date: string (YYYY-MM-DD)`

### Output
- Success: `{ ok: true, items: Array<{ id: string, text: string, images: string[], createdAt: number, likeCount: number, liked: boolean, commentCount: number }> }`
  - `images`: 图片可访问 URL 列表（优先为 `https://...` 临时链接；若生成失败可回退为 `cloud://...` fileID，由客户端自行处理）
- Errors: `NO_REL | MISSING_DATE`
