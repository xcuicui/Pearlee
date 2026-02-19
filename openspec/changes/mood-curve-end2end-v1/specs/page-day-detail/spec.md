# Spec Delta: page-day-detail (mood-curve-end2end-v1)

## ADDED Requirements

### Requirement: Show mood on each entry card when available
日详情页在渲染每条碎碎念（entry card）时，页面 MUST 满足：

- 若该条 entry 包含 `mood_level`：页面 MUST 展示心情（仅 `emoji + 文案`，如：`☀ 温暖`）
- 若无 `mood_level`：不展示心情
- MUST 不展示数字刻度

#### Scenario: Show mood badge
Given day_entries 返回某条 entry 的 `mood_level=4`
When 我打开该日详情页
Then 该条 entry card 展示「✨ 很开心」

#### Scenario: Hide mood badge when missing
Given day_entries 返回某条 entry 不包含 `mood_level`
When 我打开该日详情页
Then 该条 entry card 不展示心情
