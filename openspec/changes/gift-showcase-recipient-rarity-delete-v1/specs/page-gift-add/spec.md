## ADDED Requirements

### Requirement: AddGiftPage fields and defaults
AddGiftPage MUST 支持上传礼物，并包含以下字段：

1) 名称（必填，<=12字）
2) 描述（可选，<=40字）
3) 稀有度（必选）
   - 常见：更容易遇见
   - 偶尔：偶尔出现
   - 稀有：很少出现
4) 送给谁（必选）
   - 默认：送给 {对方昵称}
   - 可切换：送给我

默认策略：
- 稀有度默认选中“偶尔”
- recipient 默认选中“对方”

按钮：`放进橱窗`

校验：
- 名称为空 MUST 阻止提交
- 稀有度未选 MUST 阻止提交
- recipient 未选 MUST 阻止提交

#### Scenario: Submit valid gift
- **GIVEN** 用户填写合法名称并选择稀有度与 recipient
- **WHEN** 点击 `放进橱窗`
- **THEN** 调用 `gift_definitions_upsert`
- **AND** 成功后返回橱窗页并刷新列表
