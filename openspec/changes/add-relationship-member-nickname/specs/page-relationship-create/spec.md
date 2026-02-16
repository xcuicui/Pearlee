## ADDED Requirements
### Requirement: Set My Nickname During Create Flow
创建关系流程 MUST 增加“设定我的昵称”步骤（强入口）。

#### Scenario: Prompt nickname
- **WHEN** 用户创建关系
- **THEN** 页面展示标题“你希望 TA 在这里怎么称呼你？”与输入框

#### Scenario: Validate nickname
- **GIVEN** nickname trim 后为空或长度不在 1-10
- **WHEN** 用户提交
- **THEN** 阻止并提示

#### Scenario: Persist nickname
- **GIVEN** nickname 合法
- **WHEN** 用户提交创建
- **THEN** 调用 `relationship_create({ nickname, ... })` 并写入 relationship_members
