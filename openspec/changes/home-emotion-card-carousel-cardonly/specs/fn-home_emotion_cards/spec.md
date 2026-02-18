## ADDED Requirements

### Requirement: Card-only emotion cards feed
云函数 `home_emotion_cards` MUST 提供首页情绪卡片列表数据，并且仅返回渲染卡片所需的最小字段集合。

#### Scenario: Has relationship returns cards array
- **GIVEN** 用户已加入未封存关系
- **WHEN** 调用 `home_emotion_cards()`
- **THEN** 返回 `{ ok: true, relationshipId: <string>, cards: CardItem[] }`
- **AND** `cards` MUST 为数组（允许为空数组）

#### Scenario: No relationship returns empty relationshipId
- **GIVEN** 用户没有未封存关系
- **WHEN** 调用 `home_emotion_cards()`
- **THEN** 返回 `{ ok: true, relationshipId: '' , cards: [] }`

### Requirement: CardItem minimal fields
`home_emotion_cards` 返回的 `cards` MUST 遵守最小字段契约。

#### Scenario: CardItem shape
- **WHEN** `home_emotion_cards()` 返回 `cards[i]`
- **THEN** 每一项 MUST 包含：`id`, `entryId`, `date`, `timeText`, `text`, `from`, `coverImage`
- **AND** `coverImage` 允许为空字符串

### Requirement: Compatibility with legacy single emotion
当后端无法产出多张卡片时，`home_emotion_cards` MUST 至少返回 0 或 1 张卡片，并保持与现有 `home_feed.emotion` 字段一致的展示含义。

#### Scenario: Single card fallback
- **GIVEN** 仅能取到 1 条可展示情绪内容
- **WHEN** 调用 `home_emotion_cards()`
- **THEN** `cards.length === 1`
- **AND** 该卡片语义等价于旧 `home_feed.emotion`

## Data Contracts

### Upstream Function Contract
- Request: `home_emotion_cards({ limit?: number }): { ok: true, relationshipId: string, cards: CardItem[] }`

### CardItem
- `id: string` (card id, MAY equal entryId)
- `entryId: string`
- `date: string (YYYY-MM-DD)`
- `timeText: string`
- `text: string`
- `from: string`
- `coverImage: string`
