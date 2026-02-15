## 1. Spec
- [x] 1.1 Add delta specs for `page-entry-publish`, `fn-entry_create`, `fn-day_entries`, and `page-day-detail` to raise image limit from 3 to 9
- [x] 1.2 Validate change and base specs with strict non-interactive commands

## 2. Implementation
- [x] 2.1 Update publish page to allow selecting, previewing, and removing up to 9 images
- [x] 2.2 Keep CloudBase upload flow and submit uploaded image IDs to `entry_create`
- [x] 2.3 Update `entry_create` validation/storage to accept at most 9 images
- [x] 2.4 Update `day_entries` to return up to 9 images
- [x] 2.5 Update day detail page to display up to 9 images in wrapped 3x3-style thumbnails and preview full list

## 3. Verification & Delivery
- [x] 3.1 Run `openspec change validate update-entry-images-9 --strict --no-interactive`
- [x] 3.2 Run `openspec validate --specs --strict --no-interactive`
- [ ] 3.3 Commit with a conventional commit message
- [ ] 3.4 Run gateway wake notification command
