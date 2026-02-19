# Tasks: murmur-day-to-global-timeline-v1

## 0) Repo scan (do not guess)
### Existing day list page
- Page: `miniprogram/pages/day/detail.(js|wxml|wxss|json)`
- Route: `/pages/day/detail?date=YYYY-MM-DD&focus=<entryId?>`
- Entry points:
  - Home week calendar day tap: `miniprogram/pages/home/index.js` `onPickDay` → `wx.navigateTo('/pages/day/detail?date=...')`
  - Home emotion card tap: `openEmotion` navigates to `/pages/day/detail?date=...&focus=...`

### Existing API
- Cloud function `day_entries`: only supports single date input `{ date }` and returns that day's entries.
- Other entry queries:
  - `cloudfunctions/home_feed/index.js` has createdAt-range queries and image temp URL mapping.

### List container type
- `pages/day/detail.wxml` uses plain `view` list (not `scroll-view`).
- No existing `scroll-into-view` usage found in repo scan.

### Build note
- `rg` (ripgrep) is not available; use `grep/find`.

## 1) OpenSpec artifacts
- [ ] Ensure `proposal.md/spec.md/design.md/tasks.md` are complete
- [ ] Add spec deltas in `openspec/changes/murmur-day-to-global-timeline-v1/specs/**` (new page + new cloud function + page-home route change)
- [ ] Run `openspec validate murmur-day-to-global-timeline-v1 --strict --no-interactive`

## 2) Spec-driven decisions to implement
- [ ] Create new page: `miniprogram/pages/murmur/timeline/*` and register in `miniprogram/app.json`
- [ ] Add new cloud function: `cloudfunctions/timeline_entries/*`
- [ ] Update home calendar tap to navigate to timeline:
  - `/pages/murmur/timeline/index?anchorDate=YYYY-MM-DD&entry=calendar`
- [ ] Keep emotion card navigation behavior unchanged (still date+focus to day detail) unless spec says otherwise

## 3) Backend: timeline_entries
- [ ] Implement `timeline_entries`:
  - relationship validation like day_entries/home_feed
  - initial window by anchorDate ± windowDays via createdAt range
  - older/newer by createdAt cursor
  - include mood_level when present
  - include likeCount/liked/commentCount aggregation (same semantics as day_entries)
  - image temp URL mapping consistent with day_entries

## 4) Frontend: MurmurTimelinePage
- [ ] Implement `scroll-view` timeline with date grouping
- [ ] First entry: load initial window; insert empty anchor group if needed
- [ ] Anchor scroll: `scroll-into-view` to anchor header id
- [ ] Pagination:
  - `scrolltolower` loads older
  - top threshold loads newer
  - dedupe by id and regroup by date
  - best-effort stable scroll on prepend

## 5) Self-test checklist
- [ ] 1) From home calendar tap enters timeline and anchors correctly
- [ ] 2) Anchor date has no entries: shows header + empty copy and still scrolls
- [ ] 3) Scroll down loads older and no duplicates
- [ ] 4) Scroll up loads newer and no duplicates
- [ ] 5) Mood emoji appears on entries that have mood_level
- [ ] 6) No obvious scroll jump on load more
- [ ] 7) No console errors
