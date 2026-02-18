# Change: home-emotion-card-carousel-cardonly

## Why
首页当前只展示 1 张情绪卡片；同时首页加载/下拉刷新通过 `home_feed` 一次性拉取并刷新关系标题、streak、周历 marks 与情绪卡片，导致首屏耦合高、开销大、失败面也更大。

需要一个最小、可回滚的改动：
- 情绪卡片支持左右滑动查看多条（Carousel）
- 首页进入/下拉刷新仅刷新“卡片数据”（card-only fetch），即使卡片请求失败，周历/关系标题等仍可正常展示（不白屏）。

## What Changes
- **Carousel**：将首页情绪卡片由单张改为可左右分页滑动的多张卡片（一次一页）。
  - `cards.length === 0`：维持现有空态（不新增大段文案）
  - `cards.length === 1`：与现状一致，不显示指示器
  - `cards.length > 1`：显示克制的 indicator-dots（卡片下方居中）
  - 点击卡片行为保持现有：进入日详情/预览（或空态进入发布页）
- **Card-only data fetch**：新增/接入一个“仅获取卡片列表”的请求，使首页在 `onLoad/onShow` 与下拉刷新仅触发 `fetchCardFeed()`，不再触发其他模块数据请求。
- **失败隔离**：卡片请求失败时，提供轻提示（toast/弱提示），但页面其他区域（关系标题/周历/FAB）保持可用且不白屏。

## Capabilities

### New Capabilities
- `fn-home_emotion_cards`: 首页情绪卡片列表数据的最小云函数契约（仅返回卡片渲染所需字段，返回数组）。

### Modified Capabilities
- `page-home`: 首页情绪卡片从单张改为 Carousel；首页进入/下拉刷新改为仅拉取卡片数据（card-only fetch），且失败不影响其他区域展示。

## Impact
- 影响代码：
  - `miniprogram/pages/home/index.wxml`：情绪卡片区域改为 swiper carousel + dots
  - `miniprogram/pages/home/index.js`：新增 `fetchCardFeed()` 并替换刷新策略（onShow/下拉刷新只拉卡片）
  - `miniprogram/pages/home/index.wxss`：补充 carousel / indicator 样式（不引入新依赖）
  - `cloudfunctions/`：新增云函数 `home_emotion_cards`（或等价最小实现）
- 不改：关系标题/周历/FAB 布局与交互（除“卡片刷新时不再触发它们的请求”）。

## Risks
- 新增卡片列表契约需与旧 `home_feed.emotion` 保持兼容（字段命名、空态、点击路由）。
- Carousel 高度需固定/稳定，避免滑动时页面抖动或影响纵向滚动。

## Rollback
- 前端：将情绪卡片区域从 swiper 回退为单卡片渲染；将刷新策略回退为现有 `home_feed` 全量刷新。
- 后端：停用 `home_emotion_cards` 云函数调用，继续使用 `home_feed` 中的 `emotion` 单卡片字段。
