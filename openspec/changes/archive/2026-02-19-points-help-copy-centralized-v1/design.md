# Design: points-help-copy-centralized-v1

## Context
当前文案由 `strings.js` 与页面内字段分散承载；要保证“统一修改”，需要把“贝壳说明域”单独收敛，而不牵动全局文案系统。

## Decisions
- 新增 `miniprogram/utils/pointsHelpCopy.js` 作为“贝壳说明域”唯一文案来源。
- 说明页用该模块渲染标题与分段行文，保留静态页面形态。
- 首页与发布页仅加入轻量提示文案 + 说明页跳转，不增加复杂组件。
- 所有说明入口统一跳转 `/pages/lottery/points-help/index`。

## Trade-offs
- 不将全部奖励文案迁入该模块，只收敛“说明域”文案，避免扩大改动面。
- 页面仍保留原有结构，采用最小 UI 增量以降低回归风险。

## Risks
- 若后续奖励规则变化，说明文案可能滞后。
  - Mitigation: 统一模块后可一次性全局更新，降低遗漏概率。
