# Spec: mood-curve-end2end-v1

## 0. Terminology
- **Moment / 碎碎念**：数据库集合 `entries` 的一条记录。
- **mood_level**：心情刻度，整数枚举 `1|2|3|4`。

## 1. Mood scale (fixed)
心情刻度固定为 4 档（emoji + 文案），且文案必须与下表一致：

| mood_level | emoji | label |
|---|---|---|
| 1 | 🌧 | 低落 |
| 2 | 🌥 | 平静 |
| 3 | ☀ | 温暖 |
| 4 | ✨ | 很开心 |

前端必须集中管理映射（constants/strings），不要散落硬编码：

```js
MOOD_MAP = {
  1: { emoji: '🌧', label: '低落' },
  2: { emoji: '🌥', label: '平静' },
  3: { emoji: '☀', label: '温暖' },
  4: { emoji: '✨', label: '很开心' }
}
```

## 2. Publish (entry composer)
### 2.1 UI
- 发布页模块标题：`今天的心情`
- 提供 4 选 1：🌧 低落 / 🌥 平静 / ☀ 温暖 / ✨ 很开心

### 2.2 Validation strategy (fixed)
本 change 采用 **必选** 策略：
- mood 未选时：阻止发布，并 toast：`先选一个今天的心情。`

### 2.3 Payload
- 调用 `entry_create` 时必须带上：`mood_level: 1|2|3|4`

## 3. Data model
### 3.1 Entry fields
- `entries.mood_level`：`1|2|3|4`（可空/缺省，用于兼容历史数据）

### 3.2 Persistence rules
- 仅当用户在发布页完成选择时写入 `mood_level`。
- 旧数据无 `mood_level` 时保持缺省，不做迁移。

## 4. 7-day mood aggregation
### 4.1 Time range
- 最近 7 天（含今天），按**用户本地日期**计算。

### 4.2 Grouping & pick rule
- 以用户本地日期（YYYY-MM-DD）分组。
- 同一天多条 Moment：取 `createdAt` 最新的一条。
- 仅统计带 `mood_level` 的 Moment。

### 4.3 Output structure
对外提供一个 7 天序列（按日期升序），每个元素：
- `date`：YYYY-MM-DD
- `mood_level`：1|2|3|4（可缺省，代表该日无 mood）
- `lastEntry`（可缺省）：
  - `contentText`：string
  - `images`：array（可选）

## 5. Home week calendar integration (core)
### 5.1 No new standalone module
- 首页不新增独立卡片模块；必须融合到现有「周历」区域。

### 5.6 Emotion card shows mood (ADDED)
- 首页顶部「情绪卡片 / emotion 卡」在展示某条碎碎念时：
  - 若该条碎碎念包含 `mood_level`：卡片 MUST 展示对应心情（仅 emoji + 文案，例如：`☀ 温暖`）
  - 若无 `mood_level`：不展示心情
- 不展示数字、不展示刻度值。

### 5.2 Mood trend overlay rendering
- 在周历内部扩展 `MoodTrendOverlay`：
  - 每天一个点（直径约 4~6px）
  - 点间连线（1~1.5px）
  - 使用低饱和蓝色（不抢主视觉）
  - 不展示 y 轴、不展示任何数字刻度
- **无 mood 的日期**：不显示点与线段。

### 5.3 Vertical mapping (no axis)
- 设定 overlay 的 `topPadding` / `bottomPadding`
- 计算：

```txt
usableHeight = overlayHeight - topPadding - bottomPadding
ratio = (mood_level - 1) / (4 - 1)
y = bottom - ratio * usableHeight
```

- level 1 最低，level 4 最高。

### 5.4 Interaction
- 点击周历某一天的日期格或点位：MUST 跳转到当日碎碎念页
  - 路由：`/pages/day/detail?date=YYYY-MM-DD`
- MUST 不弹出心情详情弹窗（避免破坏原有交互）

### 5.5 Compatibility with existing selected day
- 保留周历现有 selected day 交互与高亮。
- mood overlay 不应遮挡/破坏点击与选中态。

## 6. Strings / Copy
必须新增 strings keys（统一从 `miniprogram/utils/strings.js` 获取）：
- `MOOD_TITLE`: 今天的心情
- `MOOD_OPTION_1..4`: 🌧 低落 / 🌥 平静 / ☀ 温暖 / ✨ 很开心（若拆分 emoji/label，则也需固定）
- `MOOD_PUBLISH_REQUIRED_TOAST`: 先选一个今天的心情。
- `MOOD_SHEET_TITLE`: 这一天的心情
- `MOOD_SHEET_EMPTY`: 这一天还没有记录心情。

## 7. Acceptance criteria
1) 发布碎碎念时能选择心情（🌧/🌥/☀/✨）
2) mood 未选时阻止发布并提示：`先选一个今天的心情。`
3) `mood_level` 持久化成功（刷新后仍在）
4) 首页周历显示最近 7 天点线趋势（仅有 mood 的日显示点/线）
5) 不显示任何数字/刻度/分数
6) 同一天多条取最后一条
7) 点击周历某天会进入该日碎碎念页（不弹窗）
8) 与现有选中态兼容
9) 无报错，真机自测通过
