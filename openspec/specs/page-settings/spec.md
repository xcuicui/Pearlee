# Spec: page-settings

## Purpose
定义设置页对关系信息读取、修改、邀请码复制、封存关系及跳转的可验收行为，并约束与相关云函数契约的输入输出。

## Requirements
### Requirement: Context Loading
页面 MUST 在显示时调用 `ctx_get`，并在无关系时跳转创建页。

#### Scenario: Context exists
- **GIVEN** 用户已加入未封存关系
- **WHEN** 打开设置页
- **THEN** 页面显示关系名、开始日期、邀请码

#### Scenario: Context missing
- **GIVEN** 用户无关系
- **WHEN** 打开设置页
- **THEN** 页面重定向到关系创建页

### Requirement: Relationship Update
页面 MUST 允许用户保存关系名称和开始日期。

#### Scenario: Save relationship profile
- **GIVEN** 用户输入新名称或日期
- **WHEN** 点击保存
- **THEN** 页面调用 `relationship_update({ name, startDate })` 并提示成功

### Requirement: Relationship Archive
页面 MUST 在用户确认后执行关系封存并跳转创建页。

#### Scenario: Archive confirmed
- **GIVEN** 用户在确认弹窗点击封存
- **WHEN** 页面调用 `relationship_archive`
- **THEN** 页面提示成功并跳转关系创建页

## Data Contracts
### Client State
- `relationshipId: string`
- `name: string`
- `startDate: string`
- `inviteCode: string`
- `error: string`

### Upstream Function Contracts
- `ctx_get(): { ok: true, relationship: null | { id: string, name: string, startDate: string, inviteCode: string, memberOpenids: string[] } }`
- `relationship_update({ name?: string, startDate?: string }): { ok: true }`
- `relationship_archive({}): { ok: true }`
