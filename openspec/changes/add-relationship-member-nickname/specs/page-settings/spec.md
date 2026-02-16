## ADDED Requirements
### Requirement: Edit My Relationship Nickname
设置页 MUST 提供“在这段关系里的名字”编辑入口。

#### Scenario: Edit nickname
- **WHEN** 用户修改并保存
- **THEN** 调用 `relationship_update({ nickname })`
- **AND** 成功后提示“已更新”
- **AND** 返回首页后昵称立即生效（首页 onShow 刷新）
