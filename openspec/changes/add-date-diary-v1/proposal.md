# Change: add-date-diary-v1 (约会日记)

## Why
「约会清单」解决了“未来想做什么”的收纳，但仍需要一个“发生后的沉淀”能力：把一次约会写成图文日记，记录发生时间，并关联到清单项以形成闭环（想做 → 做了 → 留下记忆）。

## What Changes
- 新增「约会日记」发布页（独立于碎碎念发布页）：支持图文、发生时间（occurAt）、并默认要求关联某个清单项。
- 支持“临时约会”兜底：允许不关联清单项也能写一篇约会日记（但不进入清单闭环）。
- 清单项详情页可展示其关联的约会日记列表（列表能力在本 change 提供接口；UI 可在本 change 或后续一起补齐）。

## Impact
- Affected specs (new):
  - page-date-diary-create
  - fn-date_diary_create
  - fn-date_diary_list_by_plan
- Affected code (expected):
  - miniprogram/pages/date/diary-create/**
  - cloudfunctions/date_diary_* (or consolidated module)
- Notes
  - 时间线混排展示约会日记在另一个 change 实现。
