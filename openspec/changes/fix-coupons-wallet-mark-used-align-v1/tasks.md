# Tasks: fix-coupons-wallet-mark-used-align-v1

## 1. OpenSpec
- [x] 1.1 新增 change 文档：`proposal.md`、`spec.md`、`design.md`、`tasks.md`
- [x] 1.2 新增 delta spec：`specs/page-coupons-wallet/spec.md`
- [ ] 1.3 运行 `openspec validate --strict --no-interactive`

## 2. Mini Program
- [x] 2.1 在 `miniprogram/pages/coupons/wallet/index.wxss` 为 `.coupon-actions .btn-ghost` 增加局部居中样式
- [x] 2.2 不修改 `index.js` 与 `index.wxml`

## 3. Verification
- [ ] 3.1 校验变更仅影响券包页
- [ ] 3.2 提交 git commit：`fix(coupons): center mark-used button label`
