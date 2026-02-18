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

### Requirement: Card ordering by recency
`home_emotion_cards` MUST 在同一关系内按 `createdAt` 倒序返回卡片（最新在前），并受 `limit` 限制。

#### Scenario: Return cards sorted by createdAt DESC
- **GIVEN** 关系下存在多条 `isDeleted=false` 的 entries
- **WHEN** 调用 `home_emotion_cards({ limit })`
- **THEN** `cards` 按 `createdAt DESC` 排序（index 越小越新）
- **AND** 返回条数 `<= limit`

### Requirement: CardItem minimal fields
`home_emotion_cards` 返回的 `cards` MUST 遵守最小字段契约。

#### Scenario: CardItem shape
- **WHEN** `home_emotion_cards()` 返回 `cards[i]`
- **THEN** 每一项 MUST 包含：`id`, `entryId`, `date`, `timeText`, `text`, `from`, `images`, `coverImage`
- **AND** `images` MUST 为数组，长度 0-9，元素为可直接渲染的临时 URL 字符串
- **AND** `coverImage` 允许为空字符串

#### Scenario: coverImage is first image
- **GIVEN** `cards[i].images.length > 0`
- **WHEN** 后端组装 CardItem
- **THEN** `coverImage === images[0]`

#### Scenario: coverImage empty when no image
- **GIVEN** `cards[i].images.length === 0`
- **WHEN** 后端组装 CardItem
- **THEN** `coverImage === ''`

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
- `images: string[]` (0-9, temp URLs)
- `coverImage: string`
