# Tasks: points-help-copy-centralized-v1

## 1. OpenSpec
- [x] 1.1 新增 change 文档：`proposal.md`、`spec.md`、`design.md`、`tasks.md`
- [x] 1.2 新增 delta specs：
  - `specs/page-points-help/spec.md`
  - `specs/page-home/spec.md`
  - `specs/page-entry-publish/spec.md`
  - `specs/page-lottery/spec.md`
- [x] 1.3 运行 `openspec validate points-help-copy-centralized-v1 --strict --no-interactive` 并通过

## 2. Mini Program
- [x] 2.1 新增统一文案模块 `miniprogram/utils/pointsHelpCopy.js`
- [x] 2.2 说明页改为读取统一文案模块渲染
- [x] 2.3 抽奖页“贝壳说明”入口文案改为读取统一文案模块
- [x] 2.4 首页打卡区域新增轻提示 + 说明页跳转
- [x] 2.5 发布页新增轻提示 + 说明页跳转

## 3. Verification
- [x] 3.1 对改动 JS 运行 `node -c`
- [x] 3.2 检查关键改动 `git diff`
- [x] 3.3 输出 `git status --short`
