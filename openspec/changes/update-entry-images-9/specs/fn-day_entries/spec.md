## MODIFIED Requirements
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
