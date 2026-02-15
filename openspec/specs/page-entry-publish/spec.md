# Spec: page-entry-publish

## Purpose
定义发布页文本输入、发布提交和取消行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Text Validation
页面 MUST 在提交前校验文本非空。

#### Scenario: Empty text blocked
- **GIVEN** 输入文本为空或仅空白
- **WHEN** 用户点击发布
- **THEN** 页面显示“写点什么吧。”并阻止提交

### Requirement: Entry Publish
页面 MUST 在校验通过时创建 entry 并返回上一页。

#### Scenario: Publish success
- **GIVEN** 输入文本有效
- **WHEN** 用户点击发布
- **THEN** 页面调用 `entry_create({ text })`，提示成功并返回上一页

### Requirement: Cancel Publish
页面 MUST 支持取消并返回。

#### Scenario: Cancel
- **GIVEN** 用户在发布页
- **WHEN** 点击取消
- **THEN** 页面返回上一页

## Data Contracts
### Client State
- `text: string`
- `error: string`

### Upstream Function Contract
- `entry_create({ text: string }): { ok: true, id: string }`
