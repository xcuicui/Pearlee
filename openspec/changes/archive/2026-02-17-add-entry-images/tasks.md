## 1. Spec
- [x] 1.1 Add delta specs for publish page, entry_create, day detail, day_entries, and home_feed contract stability
- [x] 1.2 Validate change and specs with strict non-interactive commands

## 2. Implementation
- [x] 2.1 Add publish page image picker (max 3), preview, and remove interactions
- [x] 2.2 Upload images to CloudBase via `wx.cloud.uploadFile` before `entry_create`
- [x] 2.3 Extend `entry_create` to accept/validate/store `images` (<= 3)
- [x] 2.4 Extend `day_entries` to return `images` for each item
- [x] 2.5 Render day detail entry images (up to 3)

## 3. Verification & Delivery
- [x] 3.1 Run OpenSpec validations and ensure all checklist items are complete
- [x] 3.2 Commit spec + code changes using conventional commit
- [x] 3.3 Send gateway wake notification
