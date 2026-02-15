# Change: Add Entry Images

## Why
MVP currently supports text-only entries, which limits emotional context and daily memory richness. We need a minimal image flow that keeps publishing simple while extending day detail display.

## What Changes
- Add client-side image selection on publish page with max 3 images, preview, and removal.
- Upload selected images to CloudBase storage before calling `entry_create`.
- Extend `entry_create` input validation and persistence with `images` (fileID array, max 3).
- Extend `day_entries` response to include entry images.
- Render entry images on day detail page (up to 3 thumbnails).
- Keep `home_feed` emotion card `text` contract stable (`contentText` source), no image field added.

## Impact
- Affected specs: `page-entry-publish`, `fn-entry_create`, `page-day-detail`, `fn-day_entries`, `fn-home_feed`
- Affected code:
  - `miniprogram/pages/entry/publish.*`
  - `miniprogram/pages/day/detail.*`
  - `cloudfunctions/entry_create/index.js`
  - `cloudfunctions/day_entries/index.js`
