# Tasks: update-coupons-wallet-fold-v1

## 1. OpenSpec
- [x] 1.1 补齐 change 文档：`proposal.md`、`spec.md`、`design.md`、`tasks.md`
- [x] 1.2 新增 delta spec：`specs/page-coupons-wallet/spec.md`
- [x] 1.3 运行 `openspec validate update-coupons-wallet-fold-v1 --strict --no-interactive` 并通过

## 2. Mini Program
- [x] 2.1 券包列表按 `title+desc` 分组折叠渲染（显示 `×N`）
- [x] 2.2 分组状态：存在未使用则显示“未使用”，否则“已使用”
- [x] 2.3 核销按钮一次只消耗 1 张券：选择组内最早获得的未使用券 id

## 3. Verification
- [x] 3.1 `node -c miniprogram/pages/coupons/wallet/index.js`
- [x] 3.2 输出 `git diff` 摘要与 `git status --short`
