## MODIFIED Requirements
### Requirement: Text Validation
函数 MUST 支持轻量记录：允许纯图片，但不允许全空。

#### Scenario: Empty content blocked
- **GIVEN** text 为空且 images 为空
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `EMPTY`

## ADDED Requirements
### Requirement: Images Limit 3
函数 MUST 限制图片最多 3。

#### Scenario: Too many images
- **GIVEN** images.length > 3
- **WHEN** 调用 `entry_create`
- **THEN** 返回业务错误 `TOO_MANY_IMAGES`

### Requirement: Persist date field
函数 MUST 写入 `date`（YYYY-MM-DD）用于周历查询。

#### Scenario: Date set
- **WHEN** 创建成功
- **THEN** entry.date 为创建当天 YYYY-MM-DD

### Requirement: Update RelationshipStats
函数 MUST 在写入后更新 RelationshipStats（current_streak/last_record_date）。

#### Scenario: Stats updated
- **WHEN** 创建成功
- **THEN** stats.updated_at 被刷新
