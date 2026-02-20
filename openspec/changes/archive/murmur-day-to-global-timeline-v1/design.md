# Design: murmur-day-to-global-timeline-v1

## 1. Page structure
- `MurmurTimelinePage` (`/pages/murmur/timeline/index`)
  - `ScrollViewTimeline`
    - `DateGroup` (header + list)
      - `TimelineItemCard` (复用 day/detail 的 entry card 风格)

## 2. Data layer (TimelineStore)
Maintain:
- `itemsById: Map<id, EntryView>`
- `groups: Array<{ date: YYYY-MM-DD, headerId: string, items: EntryView[], isAnchor?: boolean, isEmptyAnchor?: boolean }>`
- `minCreatedAt` / `maxCreatedAt`
- cursors: `olderCursor`, `newerCursor`
- loading flags: `loadingInitial`, `loadingOlder`, `loadingNewer`

Merge strategy:
- Normalize incoming items (ensure `date` exists)
- Dedupe by id
- Rebuild groups by date desc (newest date first)
- Within each date group, sort by createdAt asc

## 3. Scrolling & anchor
Implementation (WeChat Mini Program):
- Use `scroll-view` with `scroll-into-view` binding to a header node id, e.g. `date-${YYYYMMDD}`
- On first successful initial load + after `setData`, schedule:
  - `wx.nextTick(() => this.setData({ scrollIntoView: anchorHeaderId }))`
- If anchorDate has no items in window, inject an empty anchor group so the node exists.

## 4. Bidirectional pagination triggers
- older: `scroll-view` `bindscrolltolower` to load older
- newer: use `bindscroll` and when `scrollTop` < threshold (e.g. 80px) trigger newer (with debounce + guard)

## 5. Keep scroll position stable
- For appending older at bottom: natural (doesn’t shift viewport)
- For prepending newer at top: record current first visible group/header position via `createSelectorQuery().select(...).boundingClientRect` before setData, then after setData adjust `scrollTop` by delta.
- If stable prepend is too complex, spec allows “no obvious jump” — do best-effort and add throttle.
