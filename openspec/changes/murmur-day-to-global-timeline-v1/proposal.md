# Proposal: murmur-day-to-global-timeline-v1

## Background
当前从首页周历点击某一天会进入「某日碎碎念列表页」(`/pages/day/detail?date=YYYY-MM-DD`)。
这个页面只能看到当天内容，无法自然地向上/向下翻阅前后日期的碎碎念，回忆体验被日期边界切断。

## Goals
- 将入口升级为统一的「全量碎碎念时间线」(global timeline)
- 首次进入自动定位到用户点击的那一天（anchorDate）
- 支持上下滑动浏览前后日期
- 支持双向分页（older/newer）加载更多
- 保持按日期分组的时间线风格展示（克制，不做社交 feed）

## Non-Goals
- 不改碎碎念内容结构、编辑能力、互动能力（点赞/评论/图片展示规则不改）
- 不引入第三方虚拟列表库
- 不把页面做成算法推荐/社交 feed
- 除非必须，不改后端 schema（可以新增最小查询云函数）

## Risks
- anchor 定位时机不稳定（需要等 layout ready）
- 双向加载 prepend/append 可能导致滚动跳动
- 分页合并去重策略不当导致重复或日期分组错乱

## Rollback
- 保留旧 `/pages/day/detail` 页面与 `day_entries` 云函数
- 若新时间线页出现问题，可将周历点击入口回切到旧路由
