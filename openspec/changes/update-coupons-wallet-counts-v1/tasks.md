# Tasks: update-coupons-wallet-counts-v1

## 1. OpenSpec
- [ ] 1.1 补齐 change 文档：`proposal.md`、`spec.md`、`design.md`、`tasks.md`
- [ ] 1.2 新增 delta spec：`specs/page-coupons-wallet/spec.md`
- [ ] 1.3 运行 `openspec validate update-coupons-wallet-counts-v1 --strict --no-interactive` 并通过

## 2. Mini Program
- [ ] 2.1 分组聚合时计算 `total/used/unused` 统计
- [ ] 2.2 在券分组卡片渲染统计行：`已获得 X 张 · 已使用 Y 张 · 还剩 Z 张`

## 3. Verification
- [ ] 3.1 `node -c miniprogram/pages/coupons/wallet/index.js`
- [ ] 3.2 输出 `git diff` 摘要与 `git status --short`
