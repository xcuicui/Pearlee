## MODIFIED Requirements

### Requirement: Draw tab page follows A~E structure and uses points
抽奖 Tab 页 MUST 按 Spec A~E 结构呈现，并明确抽奖与贝壳（points_balance）的关系。

#### Scenario: Render structure
- **WHEN** 用户进入抽奖 Tab（`pages/lottery/index`）
- **THEN** 页面展示标题 `小礼物橱窗`
- **AND** 展示副标题 `偶尔为彼此准备一点小惊喜。`
- **AND** 展示一句话资产&规则：`你有 X 枚贝壳，抽小礼物一次消耗 1 枚贝壳`
- **AND** 展示主按钮 `打开一份小礼物`
- **AND** 展示按钮下方小字 `消耗 1 枚贝壳`
- **AND** 展示模块 `口袋里的小礼物`（最近 3 条）与入口 `查看全部`
- **AND** 展示底部入口 `查看小礼物橱窗`

### Requirement: Insufficient points disables CTA
当贝壳不足时，主按钮 MUST 禁用，并展示指定提示文案。

#### Scenario: points_balance < 1
- **GIVEN** `assets.points_balance < 1`
- **WHEN** 用户进入抽奖页
- **THEN** 主按钮为禁用状态
- **AND** 按钮下方小字显示：`贝壳不够啦，先去收纳一点想念。`

### Requirement: Pocket gifts show recent 3 coupons
抽奖页 MUST 展示最近 3 条已获得礼物券。

#### Scenario: Pocket list non-empty
- **GIVEN** 用户有已获得的 coupons
- **WHEN** 页面渲染 `口袋里的小礼物`
- **THEN** 展示最近 3 条（按 obtained_at 倒序）
- **AND** 每条包含：title、desc、obtained_at（格式化时间）

#### Scenario: Pocket list empty
- **GIVEN** 用户没有 coupons
- **WHEN** 页面渲染 `口袋里的小礼物`
- **THEN** 展示空态：`还没有收到小礼物`

### Requirement: Result overlay copy is gentle
抽奖结果弹层 MUST 使用温柔陪伴文案结构（无博彩词）。

#### Scenario: After draw
- **WHEN** 抽奖成功返回 prize/coupon
- **THEN** 弹层标题为：`你打开了一份小礼物`
- **AND** 展示礼物名 + 描述
- **AND** 确认按钮为：`收进口袋`
- **AND** 底部小字为：`已消耗 1 枚贝壳`
