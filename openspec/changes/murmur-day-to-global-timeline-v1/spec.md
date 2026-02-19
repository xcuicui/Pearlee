# Spec: murmur-day-to-global-timeline-v1

## 0. Terminology
- **Murmur / 碎碎念 / Moment**: `entries` 集合的一条记录
- **anchorDate**: 用户点击进入时携带的本地日期（YYYY-MM-DD）
- **Global timeline**: 全量碎碎念时间线（按日期分组）

## 1. Routing
### 1.1 Unified page
- MUST 使用一个统一页面承载全量时间线：`/pages/murmur/timeline/index`
- 原「某日列表页」`/pages/day/detail`：
  - MUST 保留（用于兼容/回滚）
  - 但从周历点击进入 MUST 改为跳转到时间线页（见 1.2）

### 1.2 Route params
时间线页 MUST 支持参数：
- `anchorDate: string` (YYYY-MM-DD, 用户本地日期)
- `entry?: 'calendar' | 'other'`（可选）

## 2. Data loading strategy (fixed)
本 change 固定采用 **按 createdAt cursor 的双向分页**（因为现有后端查询已基于 createdAt 范围，易扩展为 older/newer）：

### 2.1 Initial window
首次进入 MUST 以 `anchorDate` 为中心加载一个窗口：
- windowDays = 7
- MUST 请求范围：`[anchorDate - 7 days, anchorDate + 7 days]`
- MUST 返回该窗口内所有 entries（上限由接口定义）

### 2.2 Bidirectional pagination
页面 MUST 支持双向加载更多：
- **older**：向下加载更早内容（createdAt 更小）
- **newer**：向上加载更新内容（createdAt 更大）

必须满足：
- 去重：以 `entry.id` 去重
- 合并后 MUST 重新按日期分组渲染
- 加载更多时 MUST 尽量保持滚动位置稳定（不明显跳动）

## 3. API
### 3.1 New cloud function: timeline_entries
MUST 新增云函数：`timeline_entries`

#### Input
```ts
{
  anchorDate: string, // YYYY-MM-DD
  windowDays?: number, // default 7
  direction?: 'initial' | 'older' | 'newer',
  cursor?: number // createdAt timestamp (ms)
  limit?: number // default 60
}
```

#### Output
```ts
{
  ok: true,
  items: Array<{
    id: string,
    text: string,
    images: string[],
    createdAt: number,
    date: string, // YYYY-MM-DD (local dayKey)
    mood_level?: 1|2|3|4,
    likeCount: number,
    liked: boolean,
    commentCount: number
  }>,
  olderCursor?: number,
  newerCursor?: number,
  anchorDate: string
}
```

Rules:
- initial: 返回 anchorDate ± windowDays 范围内 entries（createdAt asc）
- older: 返回 createdAt < cursor 的更早 entries（createdAt desc or asc but consistent）
- newer: 返回 createdAt > cursor 的更新 entries
- images MUST 返回可渲染 URL（https temp 或 fallback cloud://），与 `day_entries` 一致

## 4. Rendering
### 4.1 Group by date
时间线页 MUST 按日期分组渲染：
- Header: `2月19日` / `2月18日` ...
- 每组下渲染该日 entries（按 createdAt asc）

### 4.2 Mood display
每条 entry card 若含 `mood_level` MUST 展示心情（emoji + 文案），不展示数字。

## 5. Anchor scroll
- 首次进入且首屏渲染完成后 MUST 自动定位到 `anchorDate` 分组 header
- 若窗口中 anchorDate 没有任何 entry：
  - MUST 插入一个 anchorDate 的空分组 header
  - 并展示轻空态文案：`这一天还没有收纳碎碎念。`
- 定位行为 MUST 仅首次进入执行一次（返回页面不强制跳）

## 6. Interaction
- 用户可自然上下滑动浏览
- 当滚动接近底部 MUST 触发加载 older
- 当滚动接近顶部 MUST 触发加载 newer

## 7. Acceptance criteria
1) 从周历点击某日进入时间线页，自动定位到该日
2) 可上下滑动浏览前后日期内容
3) 向下可加载更早；向上可加载更新（若有）
4) anchorDate 无内容时仍定位到 header，并有轻空态
5) 合并去重无重复、无明显跳动
6) 卡片/图片/心情展示不回归
7) 无报错，真机自测通过
