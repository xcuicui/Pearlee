## ADDED Requirements

### Requirement: Plan detail shows basic info
客户端 MUST 提供清单项详情页，展示标题与备注（若存在）。

#### Scenario: Render detail
- **GIVEN** 用户从清单列表进入某条清单项
- **WHEN** 页面加载完成
- **THEN** 页面展示该清单项的标题与备注（若为空则不渲染备注区域）

### Requirement: Plan tags visible
清单项详情页 MUST 展示该清单项已选择的 tags。

#### Scenario: Show tags
- **GIVEN** 该清单项存在 tagIds
- **WHEN** 渲染清单项详情页
- **THEN** 页面以 chips 形式展示 tags（按 tag 类型分组或混排均可）

### Requirement: Edit plan tags
清单项详情页 MUST 支持编辑 tags（新增/移除），并在保存后更新清单项。

#### Scenario: Add a tag
- **GIVEN** 清单项当前未包含某个 tag
- **WHEN** 用户在编辑面板中选择该 tag 并保存
- **THEN** 页面调用 `date_plan_update({ planId, tagIds })`
- **AND** 成功后详情页展示更新后的 tags

#### Scenario: Remove a tag
- **GIVEN** 清单项当前已包含某个 tag
- **WHEN** 用户取消选择该 tag 并保存
- **THEN** 页面调用 `date_plan_update({ planId, tagIds })`
- **AND** 成功后详情页展示更新后的 tags

### Requirement: Plan completion toggle
清单项详情页 MUST 支持标记完成与取消完成。

#### Scenario: Mark done
- **GIVEN** 清单项当前为 open
- **WHEN** 用户点击“标记已完成”
- **THEN** 页面调用 `date_plan_done({ planId, done: true })`
- **AND** 成功后该清单项状态更新为 done

#### Scenario: Undo done
- **GIVEN** 清单项当前为 done
- **WHEN** 用户点击“取消完成”
- **THEN** 页面调用 `date_plan_done({ planId, done: false })`
- **AND** 成功后该清单项状态更新为 open

### Requirement: Diary section placeholder
清单项详情页 MUST 提供「约会日记」关联区域的入口位（具体创建与列表能力由后续 change 实现）。

#### Scenario: Diary section visible
- **WHEN** 渲染清单项详情页
- **THEN** 页面展示“约会日记”相关区域（可为占位/入口按钮）
