## MODIFIED Requirements
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

## ADDED Requirements
### Requirement: Emotion Contract Compatibility
函数 MUST 不因 entry 图片字段而改变情绪卡片结构。

#### Scenario: Entry has images
- **GIVEN** 被选中的 entry 含有 `images`
- **WHEN** 返回 `home_feed`
- **THEN** `emotion` 字段结构保持不变，不新增图片字段
