# Spec: page-home

## Purpose
定义首页在关系存在/不存在场景下的数据加载、情绪卡片展示、月历点亮与路由导航等可验收行为，并明确与云函数契约的一致性。
## Requirements
### Requirement: Home Data Loading
页面 MUST 在展示时调用 `home_emotion_cards` 并根据结果更新情绪卡片列表；不得因卡片刷新触发其他首页模块的数据请求。

#### Scenario: Existing relationship
- **GIVEN** 用户已加入未封存关系
- **WHEN** 打开首页或下拉刷新
- **THEN** 页面默认调用 `home_emotion_cards({ limit: 10 })` 获取 `cards` 并更新情绪卡片区域（无加载更多）
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

### Requirement: Month Navigation
页面 MUST 支持按月切换并按目标年月重新请求首页数据。

#### Scenario: Navigate previous month
- **GIVEN** 当前显示某年某月
- **WHEN** 用户点击上个月
- **THEN** 页面更新年月并重新调用 `home_feed(year, month)`

#### Scenario: Navigate next month
- **GIVEN** 当前显示某年某月
- **WHEN** 用户点击下个月
- **THEN** 页面更新年月并重新调用 `home_feed(year, month)`

### Requirement: Calendar Mark Visibility
首页月历中的 marks MUST 在保持简洁风格下可被清晰感知，并保留现有交互行为。

#### Scenario: Marked day visual hierarchy
- **GIVEN** 月历某日期存在 `marks[date].level`
- **WHEN** 页面渲染该日期
- **THEN** 日期数字后方展示低对比度圆形 halo
- **AND** 日期底部展示较原有更明显的圆点标记
- **AND** `level=2` 的 halo 与圆点视觉权重高于 `level=1`
- **AND** 不使用厚边框或明显阴影

#### Scenario: Existing calendar interactions unchanged
- **GIVEN** 月历任意日期单元格
- **WHEN** 用户点击日期
- **THEN** 组件继续触发包含 `key` 的 `select` 事件
- **AND** 非当月日期继续保持弱化显示

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

### Requirement: Week Bar Rendering
首页 MUST 展示周历条（周一开始 7 天）并表达三种状态：有记录、今日、今日+有记录。

#### Scenario: Looks like a week strip, not a calendar grid
- **GIVEN** 首页周历条
- **WHEN** 渲染 7 天
- **THEN** 视觉上更接近“时间条/刻度条”（week strip），避免明显格子/表格感
- **AND** 每天信息密度克制：仅周几、日期数字、状态标记

#### Scenario: Has record
- **GIVEN** `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 该日展示底部圆点

#### Scenario: Today
- **GIVEN** `date === week.todayKey`
- **WHEN** 渲染周历
- **THEN** 该日展示克制的 ring（细描边或淡底圆）

#### Scenario: Today + record
- **GIVEN** `date === week.todayKey` 且 `date` 在 `week.activeDates`
- **WHEN** 渲染周历
- **THEN** 同时展示 ring 与圆点

#### Scenario: level=2 stronger than level=1
- **GIVEN** `week.levelByDate[date] = 2`
- **WHEN** 渲染该日状态
- **THEN** 圆点视觉权重高于 level=1（更实/更大/双点均可）
- **AND** 不使用重阴影或高饱和色块

### Requirement: Week Bar Navigation (Swipe)
首页 MUST 支持左右滑动切换周并重新请求 home_feed。

#### Scenario: Swipe prev week
- **GIVEN** 当前周 start
- **WHEN** 向右滑动
- **THEN** `weekStart = start - 7 days` 调用 `home_feed({ weekStart })`

#### Scenario: Swipe next week
- **GIVEN** 当前周 start
- **WHEN** 向左滑动
- **THEN** `weekStart = start + 7 days` 调用 `home_feed({ weekStart })`

### Requirement: Streak Copy
首页 MUST 在 streak>=2 时展示连续文案。

#### Scenario: Show streak
- **GIVEN** `streak.visible=true`
- **WHEN** 渲染顶部
- **THEN** 展示“最近 {N} 天都有记录”

### Requirement: Title Uses Relationship Nickname
首页顶部标题 MUST 使用关系级昵称（对方昵称），并按 fallback 策略回退。

#### Scenario: Title uses partner nickname
- **GIVEN** home_feed 返回 `partnerNickname`
- **WHEN** 渲染标题
- **THEN** 展示：`和 {partnerNickname} 的第 {X} 天`

#### Scenario: Title fallback
- **GIVEN** 对方昵称为空
- **WHEN** 渲染标题
- **THEN** 使用 fallback “对方”

### Requirement: No TA Placeholder
首页所有用户可见文案 MUST 不再出现“TA”占位符。

#### Scenario: No TA in UI
- **WHEN** 渲染首页（含情绪空态/来源/CTA）
- **THEN** 不出现字符串“TA”

### Requirement: Week Switching Animation
首页周历条 MUST 提供丝滑的滑动切周动效（随手势平移过渡），并保持数据一致性。

#### Scenario: Swipe animates week strip
- **GIVEN** 首页周历条
- **WHEN** 用户左右滑动切换周
- **THEN** 周历条随手势平移并有过渡动画（非松手瞬切）
- **AND** 动画完成后调用 `home_feed({ weekStart })` 更新对应周数据

#### Scenario: Multiple swipes stable
- **GIVEN** 用户连续滑动多周
- **WHEN** 多次切换
- **THEN** 周起始日期与展示数据保持一致，不错位

### Requirement: Subtle Arrows (A)
首页周历条两侧 MUST 展示极淡小箭头作为滑动提示，且不使用“上周/下周”文字按钮。

#### Scenario: No text buttons
- **WHEN** 渲染首页周历条
- **THEN** 不出现“上周/下周”文字按钮
- **AND** 左右存在极淡小箭头（可点击或仅提示均可）

### Requirement: Home Entry FAB (minimal)
首页 MUST 提供一个右下角固定悬浮 FAB 作为“记录入口”，且不改变首页其他结构。

#### Scenario: FAB always visible
- **WHEN** 渲染首页
- **THEN** 页面右下角存在一个圆形 FAB（仅图标，无文字）
- **AND** FAB 不依赖 `today.hasAny`（永远存在）

#### Scenario: FAB navigates to publish
- **WHEN** 用户点击 FAB
- **THEN** 进入现有发布页 `/pages/entry/publish`

#### Scenario: No today status card
- **WHEN** 渲染首页
- **THEN** 页面不再出现原“今天还没有留下记录/今天已被点亮”状态卡片
- **AND** 页面不再出现按钮“记录这一刻”

#### Scenario: FAB does not block content or tabbar
- **WHEN** 渲染首页
- **THEN** 页面容器底部预留至少 96px 的 padding，避免 FAB 遮挡内容或 tabbar

### Requirement: Emotion card source copy uses murmur tone
首页情绪卡片 MUST 展示温柔陪伴的来源提示，使用“碎碎念”语境。

#### Scenario: Emotion from partner
- **GIVEN** 情绪卡片内容来自对方（partner）
- **WHEN** 渲染情绪卡片
- **THEN** 展示文案：`来自 {TaNickname} 的碎碎念`

#### Scenario: Emotion from me
- **GIVEN** 情绪卡片内容来自我（me）
- **WHEN** 渲染情绪卡片
- **THEN** 展示文案：`我写给 {TaNickname} 的碎碎念`

### Requirement: FAB naming (accessibility)
首页右下角入口（FAB）MUST 具有入口名称“想你的碎碎念”（允许 UI 不显示文字，但需作为 aria/辅助文案）。

#### Scenario: FAB has murmur entry name
- **WHEN** 渲染首页
- **THEN** FAB 的辅助文案/aria-label 为“想你的碎碎念"

### Requirement: FAB bubble hint
首页 FAB 附近 MUST 出现一个轻量气泡暗示，文案为“想你的碎碎念”。

#### Scenario: Bubble hint visible
- **WHEN** 渲染首页
- **THEN** FAB 附近展示气泡暗示文案“想你的碎碎念”
- **AND** 气泡不应引入额外解释性长文案

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
- **AND** 通过“半露出下一张卡片（peek）”提示用户可左右滑动（不使用 indicator-dots）

#### Scenario: Carousel order follows recency
- **GIVEN** `home_emotion_cards` 返回的 `cards` 已按时间倒序
- **WHEN** 用户在首页左右滑动卡片
- **THEN** index 0 为最新卡片，后续 index 依次更旧
- **AND** 左侧卡片更新于右侧卡片（从最新到更旧）

### Requirement: Emotion card image grid
情绪卡片在有图片时 MUST 展示最多 3 张缩略图（3 列单行）。

#### Scenario: Show thumbnails when images exist
- **GIVEN** 某卡片 `images.length > 0`
- **WHEN** 渲染该卡片
- **THEN** 页面展示图片网格
- **AND** 仅渲染前 3 张图片（若超过 3 张，仅展示前 3 张）
- **AND** 每张图片使用 `aspectFill` 缩放

#### Scenario: Hide image grid when empty
- **GIVEN** 某卡片 `images.length === 0`
- **WHEN** 渲染该卡片
- **THEN** 页面不渲染图片网格区域

### Requirement: Emotion card text clamp
情绪卡片正文 MUST 限制展示行数，避免因为长文本导致卡片高度被撑大与出现大面积空白。

#### Scenario: Clamp to 3 lines
- **GIVEN** 某卡片 `text` 较长
- **WHEN** 渲染情绪卡片正文
- **THEN** 最多展示 3 行
- **AND** 超出部分以省略形式截断（不扩展卡片高度）

## Data Contracts
### Client State
- `relationshipId: string`
- `relName: string`
- `startDate: string (YYYY-MM-DD or empty)`
- `days: number`
- `month: { year: number, month: number }`
- `marks: Record<YYYY-MM-DD, { level: 1 | 2 }>`
- `emotion: { empty: boolean, entryId?: string, date?: string, text?: string, from?: string, timeText?: string, coverImage?: string }`
  - `coverImage` 存在时首页情绪卡片展示图片情绪封面
- `today: { key: string, hasAny: boolean }`

### Upstream Function Contract
- Request: `home_feed({ year?: number, month?: number })`
- Response: `{ ok: true, relationshipId: string, relationshipName?: string, startDate?: string, marks?: object, emotion?: object, today?: object }`
