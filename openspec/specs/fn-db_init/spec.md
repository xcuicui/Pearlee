# Spec: fn-db_init

## Purpose
定义数据库初始化/校验能力：确保必需集合与索引存在、记录创建策略与失败原因，并输出可审计的初始化报告用于联调验收。

## Requirements
### Requirement: Ensure Required Collections
函数 MUST 覆盖 `users/relationships/entries/likes/comments` 的存在性检查与创建尝试。

#### Scenario: Collection missing
- **GIVEN** 某集合不存在
- **WHEN** 调用 `db_init`
- **THEN** 函数尝试通过 `createCollection` 或 dummy 写入策略创建集合并记录结果

### Requirement: Ensure Required Indexes
函数 MUST 对已可用集合创建约定索引，并对不可创建场景给出状态。

#### Scenario: Index exists already
- **GIVEN** 索引已存在
- **WHEN** 调用 `db_init`
- **THEN** 返回该索引 `ok: true` 且标记为已存在

#### Scenario: Collection unavailable
- **GIVEN** 集合初始化失败
- **WHEN** 创建该集合索引
- **THEN** 索引项返回 `skipped: true`

### Requirement: Initialization Report
函数 MUST 返回版本号、耗时边界与可审计报告。

#### Scenario: Return report
- **GIVEN** 初始化流程完成
- **WHEN** 返回结果
- **THEN** 含 `version/startedAt/finishedAt/report.summary`

## Data Contracts
### Input
- `event`: 无必填字段

### Output
- `{ ok: boolean, version: string, startedAt: number, finishedAt: number, report: { collections: CollectionReport[], indexes: IndexReport[], summary: { totalCollections: number, okCollections: number, totalIndexes: number, okIndexes: number, skippedIndexes: number } } }`
