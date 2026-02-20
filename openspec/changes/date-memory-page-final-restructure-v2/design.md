## Context
目标是将「约会日记页」重构为“手帐式回忆页”，不改数据模型与提交逻辑，仅调整 UI 层级与文案。

## Goals / Non-Goals
- Goals
  - 页面不再像表单
  - 图片优先
  - 时间弱化但有书页感（日期强化区）
  - 关联清单降级
  - CTA 有仪式感
- Non-Goals
  - 不改 date_diary_create 入参（planId/occurAt/text/images）
  - 不引入新组件库/复杂动画

## Component tree (new)
- Page (/pages/date/diary-create/index)
  - Header
    - H1: 这一天的回忆
    - Secondary: 和 {TaNickname} 的一次约会（best-effort ctx_get）
  - DateEmphasis
    - BigDayNumber (opacity 0.05~0.08)
    - MetaLine: YYYY.MM.DD · 周X · HH:MM（点击可编辑日期/时间，复用 picker）
  - MediaSection (priority)
    - if images.length==0: light button “+ 加一张那天的照片”
    - else if images.length==1: 16:9 rounded image
    - else: grid (max 3 thumbnails)
  - TextSection
    - textarea (paper-like, comfortable line-height)
    - placeholder: 那天发生了什么？/这一刻最想记住什么？
  - AssociationSection (secondary)
    - row: 关联到某个清单 >
    - current selection subtitle (planTitle / 临时约会)
    - tap opens existing bottom sheet picker
  - FloatingCTA
    - fixed bottom safe-area container
    - primary button: 把这一天留下

## Layout notes
- Increase whitespace, remove large gray blocks.
- Use light containers with subtle borders; avoid heavy dividers.
- Secondary text uses existing palette: rgba(38,35,31,0.45~0.6).

## Big day number implementation
- Derive day-of-month from selected occurDate (YYYY-MM-DD).
- Render as absolutely positioned large text behind the date emphasis block.
- Style:
  - font-size: 140~180rpx
  - opacity: 0.05~0.08
  - color: inherit (primary tint), but very low opacity

## Floating CTA implementation
- Keep existing submit logic, only rename copy.
- Container fixed at bottom: `bottom: env(safe-area-inset-bottom)` + padding.
- Button width full, rounded, not too tall.

## Rollback
- If needed, keep a local constant `USE_MEMORY_LAYOUT=true` and leave old form layout in code for quick rollback.
