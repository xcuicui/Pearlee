## MODIFIED Requirements

### Requirement: DrawPage empty pool UX
当橱窗中没有“给当前用户的小礼物”时，抽奖页 MUST 给出温柔明确的空态与禁用状态。

- **IF** 抽取池为空
  - 主按钮 MUST 禁用
  - 页面 MUST 提示：`橱窗里还没有给你的小礼物。`

#### Scenario: Empty pool disables CTA
- **GIVEN** 后端抽取池为空
- **WHEN** 用户打开抽奖页
- **THEN** 页面主按钮禁用并展示空池提示
