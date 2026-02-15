# Spec: page-relationship-create

## Purpose
定义创建关系页的自动重定向、表单输入和创建提交流程。

本规格用于指导实现与验收；任何与实现不一致之处必须先更新 spec 再改代码。


## Requirements
### Requirement: Existing Relationship Redirect
页面 MUST 在显示时检查关系上下文，若已存在关系则跳首页。

#### Scenario: Already in relationship
- **GIVEN** `ctx_get` 返回有效关系
- **WHEN** 打开创建页
- **THEN** 页面切换到首页 tab

### Requirement: Relationship Create Submission
页面 MUST 支持提交关系名与纪念日创建关系。

#### Scenario: Create success
- **GIVEN** 用户填写名称和可选开始日期
- **WHEN** 点击创建
- **THEN** 页面调用 `relationship_create({ name, startDate })` 并切换到首页 tab

### Requirement: Join Entry
页面 MUST 提供进入加入关系页的入口。

#### Scenario: Go join page
- **GIVEN** 用户在创建页
- **WHEN** 点击“加入关系”
- **THEN** 页面跳转到 `/pages/relationship/join`

## Data Contracts
### Client State
- `name: string` (default `我们`)
- `startDate: string`
- `error: string`

### Upstream Function Contracts
- `ctx_get(): { ok: true, relationship: null | { id: string } }`
- `relationship_create({ name?: string, startDate?: string }): { ok: true, id: string, inviteCode: string }`
