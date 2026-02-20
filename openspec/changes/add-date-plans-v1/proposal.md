# Change: add-date-plans-v1 (约会清单)

## Why
目前内容主要是「碎碎念」（偏当下心情/不在一起时的连接）。当两个人日常聊到“以后想一起做/想去的约会”，缺少一个低成本的“未来待办”容器，导致这些想法容易散落在聊天或碎碎念里，不易回收与完成。

同时，约会想法往往自带“地点/氛围/类型”等标签语义；如果没有标签系统，清单会很快变得不可筛选、不可复用。

## What Changes
- 新增「约会清单」能力：支持创建/浏览/完成约会清单项（open / done）。
- 清单项支持 tags：
  - 默认 tag 类型包含：地点（室内、户外）、氛围（松弛、浪漫、热闹）
  - 支持新增 tag
  - 支持新增 tag 类型
  - 列表页支持按 tag 筛选展示
- 新增清单项详情页：展示清单项信息，并展示其关联的「约会日记」列表入口位（记录功能在另一个 change 实现）。

## Impact
- Affected specs (new):
  - page-date-plan-list
  - page-date-plan-detail
  - fn-date_plan_list
  - fn-date_plan_create
  - fn-date_plan_done
  - fn-date_tag_type_list
  - fn-date_tag_type_create
  - fn-date_tag_list
  - fn-date_tag_create
- Affected code (expected):
  - miniprogram/pages/date/**
  - cloudfunctions/date_plan_* / date_tag_*（或合并模块）
- Notes
  - 本 change 引入「清单 + 标签 + 完成态」；图文约会日记与时间线混排在后续 change。
