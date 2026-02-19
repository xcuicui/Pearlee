# Tasks: mood-curve-end2end-v1

## 0) Repo scan (must not guess)

### Publish page (碎碎念发布页)
- Files:
  - `miniprogram/pages/entry/publish.js|wxml|wxss|json`
- Submit logic:
  - `miniprogram/pages/entry/publish.js` calls `api.call('entry_create', { text, images })`.

### Moment / Entry persistence (schema-ish)
- Cloud function:
  - `cloudfunctions/entry_create/index.js`
- Collection:
  - Writes to `db.collection('entries').add({ ... createdAt, date/dayKey, contentText, images ... })`

### Home week calendar (周历)
- Files:
  - `miniprogram/pages/home/index.js|wxml|wxss|json`
- Data source:
  - `api.call('home_feed', { weekStart })` → returns `week.days/activeDates/levelByDate` etc.

### Existing sheet/modal primitives
- Current project uses native modals:
  - `wx.showModal` in `miniprogram/pages/settings/index.js`
  - `wx.showModal` in `miniprogram/pages/coupons/wallet/index.js`
- No dedicated BottomSheet component found in repo scan.

### Home backend feed
- Cloud function:
  - `cloudfunctions/home_feed/index.js` builds `week` data and returns to home page.

---

## 1) OpenSpec artifacts
- [ ] Ensure docs exist: `proposal.md`, `spec.md`, `design.md`, `tasks.md` (this file)
- [ ] Add specs deltas:
  - [ ] `specs/page-entry-publish/spec.md`
  - [ ] `specs/fn-entry_create/spec.md`
  - [ ] `specs/fn-home_feed/spec.md`
  - [ ] `specs/page-home/spec.md`
- [ ] Run: `openspec validate mood-curve-end2end-v1 --strict --no-interactive`

## 2) Constants & strings
- [ ] Add strings keys in `miniprogram/utils/strings.js`:
  - `MOOD_TITLE`
  - `MOOD_PUBLISH_REQUIRED_TOAST`
  - `MOOD_SHEET_TITLE`
  - `MOOD_SHEET_EMPTY`
  - Option labels (either 4 fixed full strings or emoji/label split)
- [ ] Add a centralized `MOOD_MAP` constant (new file suggested):
  - `miniprogram/utils/mood.js` exporting `MOOD_MAP` + helpers

## 3) Publish page: mood picker + validation + payload
- [ ] Update `miniprogram/pages/entry/publish.wxml`:
  - Add "今天的心情" block with 4 options (single select)
- [ ] Update `miniprogram/pages/entry/publish.js`:
  - Track `selectedMoodLevel`
  - On submit: require mood; toast `先选一个今天的心情。`
  - Call `entry_create` with `{ text, images, mood_level }`
- [ ] Minimal WXSS additions for the picker (do not disturb existing layout)

## 4) Backend: persist mood_level
- [ ] Update `cloudfunctions/entry_create/index.js`:
  - Validate `mood_level` in `1..4` when provided/required
  - Store `mood_level` in the `entries` doc

## 5) Backend: 7-day mood aggregation in home_feed
- [ ] Update `cloudfunctions/home_feed/index.js`:
  - Compute last 7 local day keys (including today)
  - Query entries in 7-day window by `createdAt` range
  - Filter entries with valid `mood_level`
  - Group by dayKey and pick latest by createdAt
  - Return `mood7d` array (7 elements ordered by date asc)
    - Each element: `{ date, mood_level?, lastEntry?: { contentText } }`
  - Ensure old clients ignore new fields (backward compatible)

## 6) Frontend: home week calendar overlay + interaction

- [ ] 6.6 Emotion 卡片展示心情：当卡片对应 entry 含 `mood_level` 时，展示 `emoji + 文案`（不展示数字）

## 6.7) Day detail page shows mood
- [ ] 6.7 日详情页每条碎碎念展示心情：当 entry 含 `mood_level` 时，展示 `emoji + 文案`（不展示数字）
  - 涉及：`cloudfunctions/day_entries/index.js` 透传 `mood_level`
  - 涉及：`miniprogram/pages/day/detail.(js|wxml|wxss)` 渲染
- [ ] Update `miniprogram/pages/home/index.js`:
  - Consume `home_feed` response `mood7d` into page data
  - Keep week swiper behavior unchanged
  - Implement tap handler for day cell to open that day's entries page: `/pages/day/detail?date=YYYY-MM-DD`
- [ ] Update `miniprogram/pages/home/index.wxml`:
  - Add overlay layer inside existing week calendar area
  - Render dots/lines for mood7d (only when mood_level exists)
  - Ensure taps on day cells still work; tapping dot/day triggers same handler
- [ ] Update `miniprogram/pages/home/index.wxss`:
  - Style overlay (dot/line low-sat blue)
  - Ensure overlay positioning aligns with 7 day columns

## 7) Tap day navigation (MVP)
- [ ] Tapping a day in week calendar navigates to that day’s entries:
  - `wx.navigateTo({ url: '/pages/day/detail?date=YYYY-MM-DD' })`
  - No modal

## 8) Validation & self-test
- [ ] `openspec validate mood-curve-end2end-v1 --strict --no-interactive`
- [ ] Manual self-test (report results):
  1) publish mood selection works
  2) mood required toast when missing
  3) refresh retains mood
  4) home shows 7-day trend
  5) same-day multiple entries uses last
  6) tap day navigates to day detail page (no modal)
  7) no numeric axis
  8) no errors
