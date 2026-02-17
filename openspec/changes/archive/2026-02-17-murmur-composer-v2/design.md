# Design: Murmur Composer V2（碎碎念发布页）

## Page
- `miniprogram/pages/entry/publish.(wxml|wxss|js)`

## Structure (conceptual)
- Page container（浅贝壳底，像纸张）
  - Textarea（主体区域，大 padding，无明显边框）
  - Char count（仅剩余<=50显示，右对齐、弱化）
  - Photos section
    - “+ 添加照片”（轻入口，无计数）
    - thumbnails grid（沿用现有 3x3 wrap）
  - Primary action（唯一）
    - button: “说完了”
    - disabled when empty

## Title
- On load: set navigation bar title to date (M月D日)
- No extra helper text by default

## Tokens (existing palette)
- Page background: keep within existing soft neutrals (`#FAF9F7` / current rgba(245,247,251,...) family)
- Text primary: rgba(38,35,31,0.75~0.85)
- Primary blue: `#5F7D95` (existing)
- Disabled: use low alpha background and muted text

## Interaction
- Auto focus: enable by default (`focus=true` on textarea) unless it causes jump; keep as default in V2.
- Primary button uses existing `publish()` logic.
- Remove cancel button; rely on back.

## Minimality
- No new deps
- No backend changes
- Keep existing upload/entry_create contracts
