## ADDED Requirements

### Requirement: Lottery tab page structure
页面 MUST 作为 TabBar 新增入口，Tab 文案固定为「抽奖」，并提供：资产概览、兑换入口、抽一次、奖池展示、我的券包入口。

#### Scenario: Render page
- **WHEN** 进入抽奖页
- **THEN** 顶部展示贝壳余额与抽奖券余额
- **AND** 存在按钮「兑换」与按钮「抽一次」
- **AND** 下方展示奖池条目列表（克制展示，不包含博彩暗示文案）
- **AND** 存在入口「我的券包」可跳转券包页

### Requirement: Draw button states
页面 MUST 在无抽奖券时禁用「抽一次」，并提示用户先去兑换。

#### Scenario: Disabled when no tickets
- **GIVEN** `ticket_balance = 0`
- **WHEN** 渲染抽奖页
- **THEN** 「抽一次」按钮为禁用态
- **AND** 点击（或触发）时提示 `先去兑换抽奖券`（toast 或文案）

#### Scenario: Draw success shows result
- **GIVEN** `ticket_balance >= 1`
- **WHEN** 用户点击「抽一次」且 `lottery_draw` 成功
- **THEN** 页面弹出结果弹窗，使用温柔语气展示获得的小心愿券标题与描述
- **AND** 抽奖券余额更新
