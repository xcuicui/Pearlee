# Change: add-date-plans-v1 (约会清单)

## Why
目前内容主要是「碎碎念」（偏当下心情/不在一起时的连接）。当两个人日常聊到“以后想一起做/想去的约会”，缺少一个低成本的“未来待办”容器，导致这些想法容易散落在聊天或碎碎念里，不易回收与完成。

## What Changes
- 新增「约会清单」能力：支持创建/浏览/完成约会清单项（open / done）。
- 新增清单项详情页：展示清单项信息，并展示其关联的「约会日记」列表入口位（记录功能在另一个 change 实现）。

## Impact
- Affected specs (new):
  - page-date-plan-list
  - page-date-plan-detail
  - fn-date_plan_list
  - fn-date_plan_create
  - fn-date_plan_done
- Affected code (expected):
  - miniprogram/pages/date/**
  - cloudfunctions/date_plan_* (or consolidated module)
- Notes
  - 本 change 仅引入「清单」与「完成态」；图文日记与时间线混排在后续 change。
