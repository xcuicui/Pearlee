# Proposal: points-help-copy-centralized-v1

## Background
当前“贝壳说明”相关文案分散在多个页面与 keys 中，且文案不够具体；首页打卡与发布页也缺少可直达说明页的轻提示，用户难以在关键操作点理解“怎么获得/怎么消耗”。

## Goals
- 统一管理“贝壳说明”相关文案，后续可一处修改。
- 提升说明页具体度：来源、消耗路径、体验边界更明确。
- 在关键操作点补充轻提示：首页打卡、发布页。
- 保持最小前端改动，不影响奖励发放与抽奖逻辑。

## Non-goals
- 不修改任何后端奖励/抽奖计算逻辑。
- 不引入远端配置或网络请求。

## Impact
- Affected specs: `page-points-help`, `page-home`, `page-entry-publish`, `page-lottery`
- Affected code:
  - `miniprogram/utils/pointsHelpCopy.js`（新）
  - `miniprogram/pages/lottery/points-help/index.(js|wxml)`
  - `miniprogram/pages/lottery/index.js`
  - `miniprogram/pages/home/index.(js|wxml|wxss)`
  - `miniprogram/pages/entry/publish.(js|wxml|wxss)`
