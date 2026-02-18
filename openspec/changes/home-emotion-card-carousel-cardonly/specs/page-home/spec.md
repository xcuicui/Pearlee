## MODIFIED Requirements

### Requirement: Home Data Loading
页面 MUST 在展示时调用 `home_emotion_cards` 并根据结果更新情绪卡片列表；不得因卡片刷新触发其他首页模块的数据请求。

#### Scenario: Existing relationship
- **GIVEN** 用户已加入未封存关系
- **WHEN** 打开首页或下拉刷新
- **THEN** 页面调用 `home_emotion_cards()` 获取 `cards` 并更新情绪卡片区域
- **AND** 该刷新流程 MUST 不触发 `home_feed` 请求

#### Scenario: Header hydration via ctx_get (best-effort)
- **GIVEN** 首页关系标题需要展示对方昵称与天数
- **WHEN** 进入首页
- **THEN** 页面 MAY 调用 `ctx_get()` 以补全 `nickname/startDate/days`（best-effort）
- **AND** `ctx_get` 失败时首页仍可使用（不白屏）

#### Scenario: No relationship
- **GIVEN** 用户没有未封存关系
- **WHEN** `home_emotion_cards` 返回 `relationshipId=''`
- **THEN** 页面跳转到关系创建页

#### Scenario: Card fetch failure does not white-screen
- **GIVEN** 首页周历/关系标题/FAB 已可渲染
- **WHEN** `home_emotion_cards` 请求失败
- **THEN** 页面展示轻提示（toast/弱提示）
- **AND** 周历/关系标题/FAB 仍可正常使用

### Requirement: Emotion Card Routing
页面 MUST 支持从情绪卡片进入对应日详情，若无可用 entry 则进入发布页。

#### Scenario: Card has entry
- **GIVEN** 任意情绪卡片含 `entryId` 与 `date`
- **WHEN** 用户点击该卡片
- **THEN** 页面跳转 `/pages/day/detail?date=<date>&focus=<entryId>`

#### Scenario: Cards empty
- **GIVEN** 情绪卡片列表为空
- **WHEN** 用户点击情绪卡片区域
- **THEN** 页面跳转发布页 `/pages/entry/publish`

## ADDED Requirements

### Requirement: Emotion cards carousel
首页情绪卡片 MUST 以横向分页滑动（Carousel）展示，且仅卡片区域可横向滑动，不影响页面纵向滚动。滑动时 MUST 由整张卡片容器切页，而不是静态外壳内局部内容切换。

#### Scenario: Zero cards keeps empty state
- **GIVEN** `cards.length === 0`
- **WHEN** 渲染情绪卡片区域
- **THEN** 维持现有空态展示（不新增大段文案）

#### Scenario: One card no indicator
- **GIVEN** `cards.length === 1`
- **WHEN** 渲染情绪卡片区域
- **THEN** 展示 1 张可点击卡片（`swiper-item` 内含卡片容器）
- **AND** 不显示指示器 dots

#### Scenario: Multiple cards show indicator
- **GIVEN** `cards.length > 1`
- **WHEN** 渲染情绪卡片区域
- **THEN** 支持左右分页滑动，一次一页，且每个 `swiper-item` 都独立承载整张卡片容器
- **AND** 在卡片下方居中显示 indicator-dots

### Requirement: Emotion card image grid
情绪卡片在有图片时 MUST 展示 1-9 张缩略图网格（3 列）。

#### Scenario: Show thumbnails when images exist
- **GIVEN** 某卡片 `images.length > 0`
- **WHEN** 渲染该卡片
- **THEN** 页面展示图片网格
- **AND** 仅渲染前 9 张图片
- **AND** 每张图片使用 `aspectFill` 缩放

#### Scenario: Hide image grid when empty
- **GIVEN** 某卡片 `images.length === 0`
- **WHEN** 渲染该卡片
- **THEN** 页面不渲染图片网格区域

### Requirement: Indicator style
情绪卡片指示器 MUST 克制（不抢主视觉），使用次级文字色/淡蓝灰 token。

#### Scenario: Indicator color uses token
- **GIVEN** `cards.length > 1`
- **WHEN** 渲染 indicator-dots
- **THEN** dots 颜色使用项目 token（次级文字色/淡蓝灰）
