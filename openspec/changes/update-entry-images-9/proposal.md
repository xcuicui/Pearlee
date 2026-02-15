# Change: Update Entry Image Limit to 9

## Why
Current image support caps each entry at 3 images, which is too restrictive for richer daily records. Increasing to 9 keeps the same flow while enabling fuller context.

## What Changes
- Increase publish page image selection limit from 3 to 9, including preview and remove interactions.
- Keep client upload flow unchanged: upload selected images to CloudBase before calling `entry_create`.
- Update `entry_create` validation and persistence to allow up to 9 images.
- Update `day_entries` output to return up to 9 images per entry.
- Update day detail image rendering to support up to 9 thumbnails in a wrapped 3x3-style layout and preview full list on tap.

## Impact
- Affected specs: `page-entry-publish`, `fn-entry_create`, `fn-day_entries`, `page-day-detail`
- Affected code:
  - `miniprogram/pages/entry/publish.*`
  - `cloudfunctions/entry_create/index.js`
  - `cloudfunctions/day_entries/index.js`
  - `miniprogram/pages/day/detail.*`
