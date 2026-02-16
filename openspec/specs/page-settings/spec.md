# Spec: page-settings (v1.3)

## Purpose
定义设置页：修改关系内昵称、修改关系开始日期、解除关系（封存）等可验收行为，并约束与相关云函数契约一致。

## Requirements
### Requirement: Context Loading
页面 MUST 在显示时调用 `ctx_get`，并在无关系时跳转创建页。

#### Scenario: Context exists
- **GIVEN** 用户已加入未封存关系
- **WHEN** 打开设置页
- **THEN** 页面显示：关系开始日期、我的关系昵称、邀请码（如仍保留）

#### Scenario: Context missing
- **GIVEN** 用户无关系
- **WHEN** 打开设置页
- **THEN** 页面重定向到关系创建页

### Requirement: Update nickname
#### Scenario: Save nickname
- **GIVEN** 用户输入新的关系昵称
- **WHEN** 点击保存
- **THEN** 页面调用 `relationship_update({ nickname })` 并提示成功

### Requirement: Update start date
#### Scenario: Save start date
- **GIVEN** 用户选择新的开始日期
- **WHEN** 点击保存
- **THEN** 页面调用 `relationship_update({ startDate })` 并提示成功

### Requirement: Relationship Archive
页面 MUST 在用户确认后执行关系封存并跳转创建页。

#### Scenario: Archive confirmed
- **GIVEN** 用户在确认弹窗点击封存
- **WHEN** 页面调用 `relationship_archive`
- **THEN** 页面提示成功并跳转关系创建页

## Data Contracts
### Client State
- `relationshipId: string`
- `nickname: string`
- `startDate: string`
- `inviteCode: string`
- `error: string`

### Upstream Function Contracts
- `ctx_get(): { ok: true, relationship: null | { id: string, startDate: string, inviteCode?: string, memberOpenids: string[] }, me?: { nickname: string }, partner?: { nickname: string } }`
- `relationship_update({ nickname?: string, startDate?: string }): { ok: true }`
- `relationship_archive({}): { ok: true }`
