# Proposal: points-help-page-v1

## Background
抽奖页当前仅展示资产规则文案（`你有 X 枚贝壳，抽小礼物一次消耗 1 枚贝壳`），缺少“贝壳从哪里来、怎么用”的解释入口，用户需要额外心智成本理解。

## Goals
- 在抽奖页资产规则区域增加“贝壳说明”入口。
- 新增轻量说明页，清晰解释贝壳来源与消耗规则。
- 保持最小改动，不引入网络请求，不改变现有抽奖行为。

## Non-goals
- 不改动抽奖后端逻辑与资产计算逻辑。
- 不新增复杂运营规则、概率说明、或动态配置。

## Impact
- Affected specs: `page-lottery`, `page-points-help`
- Affected code:
  - `miniprogram/pages/lottery/index.wxml`
  - `miniprogram/pages/lottery/index.js`
  - `miniprogram/pages/lottery/index.wxss`
  - `miniprogram/pages/lottery/points-help/index.(js|wxml|wxss|json)`
  - `miniprogram/app.json`
  - `miniprogram/utils/strings.js`
