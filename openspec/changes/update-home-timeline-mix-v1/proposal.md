# Change: update-home-timeline-mix-v1 (首页三入口 + 时间线混排约会日记)

## Why
当前写内容的入口主要是碎碎念（FAB / 发布页），且“约会清单 / 约会日记 / 碎碎念”属于三种不同写作意图：未来计划、发生沉淀、即时心情。

为了让用户在日常使用中更自然地写下内容，需要把三类入口统一、可见地放在首页下方；同时，为了回看体验一致，碎碎念时间线需要按时间混排展示约会日记。

## What Changes
- 首页新增底部「写内容入口区」：约会清单 / 约会日记 / 碎碎念。
- 时间线页（碎碎念全量时间线）支持按时间混排展示约会日记条目，并按日期分组。
- 扩展 `timeline_entries`：返回 items 支持 `type` 字段，以区分 murmur 与 dateDiary。

## Impact
- Affected specs:
  - page-home (modified)
  - page-murmur-timeline (new)
  - fn-timeline_entries (modified / formalize contract)
- Affected code (expected):
  - miniprogram/pages/home/**
  - miniprogram/pages/murmur/timeline/**
  - cloudfunctions/timeline_entries/**
- Notes
  - 是否移除/弱化首页 FAB 需在实现时做一次统一（避免重复入口）。
