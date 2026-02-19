# Tasks: points-help-page-v1

## 1. OpenSpec
- [x] 1.1 新增 change 文档：`proposal.md`、`spec.md`、`design.md`、`tasks.md`
- [x] 1.2 新增 delta spec：
  - `specs/page-lottery/spec.md`（抽奖页新增贝壳说明入口）
  - `specs/page-points-help/spec.md`（新增说明页路由与内容要求）
- [x] 1.3 运行 `openspec validate points-help-page-v1 --strict --no-interactive` 并通过

## 2. Mini Program
- [x] 2.1 新增页面 `miniprogram/pages/lottery/points-help/index.(js|wxml|wxss|json)`
- [x] 2.2 在 `miniprogram/app.json` 注册新页面
- [x] 2.3 在抽奖页资产规则区域增加“贝壳说明”入口并导航到说明页
- [x] 2.4 在 `miniprogram/utils/strings.js` 增加相关文案 key

## 3. Verification
- [x] 3.1 对变更过的 JS 运行 `node -c`
- [x] 3.2 输出 `openspec validate` 结果
- [x] 3.3 输出 `git diff` 摘要与 `git status --short`
