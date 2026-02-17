# Spec: page-relationship-join

## Purpose
定义加入关系页的邀请码输入、校验、提交与返回行为。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。
## Requirements
### Requirement: Invite Code Input
页面 MUST 支持邀请码输入，提交前去除空白并转大写。

#### Scenario: User types code
- **GIVEN** 用户在输入框输入内容
- **WHEN** 值变化
- **THEN** 页面状态保存为去空白大写邀请码

### Requirement: Join Submission
页面 MUST 校验邀请码非空并调用加入接口。

#### Scenario: Empty code
- **GIVEN** 邀请码为空
- **WHEN** 点击加入
- **THEN** 页面显示“请输入邀请码”并不调用云函数

#### Scenario: Join success
- **GIVEN** 邀请码有效
- **WHEN** 点击加入
- **THEN** 页面调用 `relationship_join({ inviteCode })` 并切换到首页 tab

### Requirement: Return Navigation
页面 MUST 支持返回上一页。

#### Scenario: Back
- **GIVEN** 用户在加入页
- **WHEN** 点击返回
- **THEN** 页面执行 `navigateBack`

### Requirement: Relationship join copy uses naming system
加入关系页 MUST 使用统一 strings key 管理文案，并遵循温柔克制语气。

#### Scenario: No hard-coded copy
- **WHEN** 渲染加入关系页
- **THEN** 页面关键文案来自 strings key
- **AND** 避免工具/任务化措辞（如“发布/取消/完成任务”）

## Data Contracts
### Client State
- `code: string`
- `error: string`

### Upstream Function Contract
- `relationship_join({ inviteCode: string }): { ok: true, id: string }`
