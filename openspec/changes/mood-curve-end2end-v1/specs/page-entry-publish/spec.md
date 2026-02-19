# Spec Delta: page-entry-publish (mood-curve-end2end-v1)

## ADDED Requirements

### Requirement: Mood picker is required
发布页 MUST 新增模块「今天的心情」，提供 4 选 1（emoji+文案）：
- 🌧 低落
- 🌥 平静
- ☀ 温暖
- ✨ 很开心

未选择心情时，必须阻止发布，并提示：`先选一个今天的心情。`

#### Scenario: Publish with mood selected
Given 我在发布页输入碎碎念内容
And 我选择了「今天的心情」为 ☀ 温暖
When 我点击发布
Then 发布成功
And 请求 `entry_create` payload 包含 `mood_level=3`

#### Scenario: Publish blocked when mood missing
Given 我在发布页输入碎碎念内容
And 我没有选择心情
When 我点击发布
Then 发布被阻止
And 我看到提示：`先选一个今天的心情。`
