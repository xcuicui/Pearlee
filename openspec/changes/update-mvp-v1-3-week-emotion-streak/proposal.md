# Change: Update MVP v1.3 (Week Calendar + Emotion + Streak + Light Publish)

## Why
当前首页以月历为主，记录状态感知较弱；v1.3 需要让“时间是主角、现在优先、关系被看见”落到稳定 MVP：周历条 + 情绪卡片优先级 + 连续系统，并将发布记录变得更轻量（允许纯图）。

## What Changes
- **BREAKING**: 首页聚合接口从“按月 marks”调整为“按周 week 数据”（周一开始，7 天）
- 首页新增/强化：
  - 关系昵称（relationship member nickname）参与顶部文案
  - 连续天数 streak（>=2 才展示）
  - 周历条支持左右滑动切换周
  - 情绪卡片优先级：对方近 3 天最新，否则随机历史（排除近 3 天），否则空态
- 发布页与 entry_create：
  - 图片上限从 9 改为 3
  - 允许“纯图片”发布（禁止全空）
  - images 结构化保存 `{ url, width, height }[]`
- 设置页：支持更新关系内昵称与开始日期

## Impact
- Affected specs:
  - fn-home_feed, page-home
  - fn-entry_create, page-entry-publish
  - fn-relationship_update, page-settings
- Affected code:
  - miniprogram/pages/home/*
  - miniprogram/pages/entry/publish*
  - cloudfunctions/home_feed/*
  - cloudfunctions/entry_create/*
  - cloudfunctions/relationship_update/*
  - miniprogram/pages/settings/*

## Notes
- 变更将通过 OpenSpec changes/deltas 提交，待确认后再进入实现阶段（codex）。
