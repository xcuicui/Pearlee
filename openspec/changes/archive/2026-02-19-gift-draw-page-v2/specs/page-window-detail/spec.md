## ADDED Requirements

### Requirement: Window detail page lists all gifts with rarity
新增页面 MUST 展示全量礼物，并以三档稀有度标签呈现（不显示百分比/概率数字）。

#### Scenario: Render window detail
- **WHEN** 用户点击抽奖页底部入口 `查看小礼物橱窗`
- **THEN** 打开橱窗详情页
- **AND** 页面标题为：`小礼物橱窗`
- **AND** 副标题为：`这里是所有可能出现的小礼物。`
- **AND** 列表展示每个礼物的名称与描述
- **AND** 每个礼物展示稀有度标签：`常见` / `偶尔` / `稀有`

### Requirement: No percentage/probability numbers
橱窗详情页 MUST 不展示任何概率数字。

#### Scenario: No numeric odds
- **WHEN** 检查橱窗详情页 UI 文案
- **THEN** 页面不包含 `%` 或 `概率/中奖率` 数字
- **AND** 不出现“爆率/欧皇/中大奖”等博彩词
