# Design: mood-curve-end2end-v1

## 1) Component structure

### 1.1 ComposerMoodPicker (publish page)
- Location: `miniprogram/pages/entry/publish.*`
- UI block:
  - Title: `今天的心情`
  - 4 options, single-select
- State:
  - `selectedMoodLevel: 1|2|3|4|null`

### 1.2 WeekCalendar + MoodTrendOverlay (home page)
- Location: `miniprogram/pages/home/index.*` (existing week calendar)
- Extend current week calendar area with an overlay layer:
  - `MoodTrendOverlay`
  - renders dots + connecting lines for 7 days

### 1.3 DayMoodSheet (detail sheet)

### 1.4 EmotionCardMoodBadge (home emotion card)
- Location: `miniprogram/pages/home/index.*`
- When an emotion card corresponds to an entry that has `mood_level`, render a small mood text: `emoji + label`.
- Style is subtle (muted), no numbers.
- Reuse existing primitives:
  - If project has a custom bottom sheet component: prefer it.
  - Otherwise MVP uses `wx.showModal` or a simple in-page overlay card.
- Content:
  - Title: `这一天的心情`
  - Date text (e.g. `2月17日`)
  - Mood: emoji + label
  - Summary (contentText, 2 lines max)
  - Empty state copy when no mood

## 2) Data flow

### 2.1 Write path
Publish page:
1) User selects mood level.
2) On submit:
   - Validate mood required.
   - Call `entry_create` with `{ text, images, mood_level }`.
3) Cloud function stores `entries.mood_level`.

### 2.2 Read / aggregation path
Home page needs:
- Recent 7-day mood series (by local date).

Implementation plan (minimal surface-area):
- Extend existing `cloudfunctions/home_feed` response to include:
  - `mood7d`: array of `{ date, mood_level?, lastEntry? }`
- In home page, feed `mood7d` into `MoodTrendOverlay`.

### 2.3 Aggregation algorithm
Input: list of `entries` within last 7 local days.
Steps:
1) Compute last 7 local day keys (YYYY-MM-DD) on server.
2) Query entries by `createdAt` in [startTs, endTs).
3) Filter entries with valid `mood_level`.
4) Group by `dateKey = entry.date || entry.dayKey || dayKey(entry.createdAt)`.
5) For each dateKey, pick entry with max `createdAt`.
6) Output 7-element array ordered by date.

## 3) Overlay coordinate mapping
- Define overlay box within the week calendar area.
- Padding:
  - `topPadding` and `bottomPadding` to avoid touching edges.
- Map mood_level -> y:
  - `ratio = (level-1)/3`
  - `y = bottom - ratio * usableHeight`

Dots/lines:
- Dot radius: 4~6px
- Line width: 1~1.5px
- Color: low-saturation brand blue (consistent with app tokens)

No axis, no numeric labels.

## 4) Interaction & state
Home page state additions:
- `mood7d`: aggregated array from backend
- `dayMoodSheetVisible`: boolean
- `dayMoodSelected`: `{ date, mood_level?, lastEntry? }`

Interaction:
- Tap day cell or dot:
  - Find date item in `mood7d` and show sheet.
  - If no mood: show empty copy.

Compatibility:
- Keep existing selected-day behavior.
- Mood overlay should not steal touches from the day cells (allow taps to pass or handle both).

## 5) Performance & safety
- All aggregation is O(N) in entries count for 7-day window.
- Best-effort behavior: if mood data fails to load, week calendar still works.

