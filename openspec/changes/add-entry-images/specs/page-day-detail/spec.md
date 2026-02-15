## MODIFIED Requirements
### Requirement: Day Entries Loading
页面 MUST 根据 `date` 查询日记录并展示聚合字段（含图片）。

#### Scenario: Load entries
- **GIVEN** 页面收到 `date` 参数
- **WHEN** 页面显示并调用 `day_entries({ date })`
- **THEN** 页面展示按时间排序的 entry 列表及点赞数、点赞态、评论、图片

## ADDED Requirements
### Requirement: Entry Images Display
页面 MUST 在每条 entry 中展示最多 3 张图片缩略图。

#### Scenario: Render images
- **GIVEN** entry 包含 `images` 数组
- **WHEN** 页面渲染该条 entry
- **THEN** 页面展示最多前 3 张图片缩略图

#### Scenario: No images
- **GIVEN** entry 不包含图片或为空数组
- **WHEN** 页面渲染该条 entry
- **THEN** 页面不展示图片区域
