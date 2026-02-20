## ADDED Requirements

### Requirement: Toggle plan done
云函数 `date_plan_done` MUST 支持将清单项标记完成或取消完成。

#### Scenario: Done true sets doneAt
- **GIVEN** 目标清单项属于当前关系
- **WHEN** 调用 `date_plan_done({ planId, done: true })`
- **THEN** 返回 `{ ok: true }`
- **AND** 清单项状态为 done 且 `doneAt` 被设置

#### Scenario: Done false clears doneAt
- **GIVEN** 目标清单项属于当前关系
- **WHEN** 调用 `date_plan_done({ planId, done: false })`
- **THEN** 返回 `{ ok: true }`
- **AND** 清单项状态为 open 且 `doneAt` 被清空
