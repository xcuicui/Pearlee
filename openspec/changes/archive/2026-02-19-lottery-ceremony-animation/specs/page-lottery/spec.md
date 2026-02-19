## MODIFIED Requirements

### Requirement: Lottery page becomes “小礼物橱窗”
页面 MUST 以温柔克制的“橱窗/礼物”叙事呈现抽奖，不带博彩感。

#### Scenario: Render structure
- **WHEN** 用户进入抽奖 Tab
- **THEN** 页面展示标题 `小礼物橱窗`
- **AND** 展示副标题 `偶尔为彼此准备一点小惊喜。`
- **AND** 展示资产行：`你有 X 枚贝壳  Y 张小礼物券`
- **AND** 展示主按钮 `打开一份小礼物`
- **AND** 展示次文案 `消耗 1 张小礼物券`

### Requirement: Pool list shows rarity, not percentage
页面 MUST 不展示百分比，不强调概率。

#### Scenario: Pool item rarity label
- **GIVEN** 奖池条目包含 `weight`
- **WHEN** 页面渲染奖池列表
- **THEN** 每个条目展示稀有度标签：`常见` / `偶尔` / `稀有`
- **AND** 不出现 `20%`、`15%` 等百分比文本

### Requirement: Ceremony animation states
页面 MUST 实现状态机 `idle → drawing → result → confirmed`。

#### Scenario: Ceremony flow
- **GIVEN** `ticket_balance >= 1`
- **WHEN** 用户点击 `打开一份小礼物`
- **THEN** 页面进入 `drawing` 状态
- **AND** 页面背景变暗（约 0.6）并轻微 blur
- **AND** 中央礼物卡片淡入 + 上浮 + scale（300~400ms ease-out）
- **AND** 服务端结果返回后进入 `result` 状态并展示结果
- **WHEN** 用户点击 `收进礼物盒`
- **THEN** 进入 `confirmed` 并关闭仪式层，回到 `idle`

### Requirement: No gambling UI
页面 MUST 避免博彩感。

#### Scenario: No roulette/slot/probability highlight
- **WHEN** 检查抽奖页交互与视觉
- **THEN** 不存在转盘
- **AND** 不存在老虎机滚动
- **AND** 不存在概率高亮或刺激性闪烁
