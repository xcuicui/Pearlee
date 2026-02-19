# Spec: fix-coupons-wallet-mark-used-align-v1

## Summary
修复券包页“标记为已使用”按钮文案垂直未居中的样式问题，确保按钮文案在按钮容器内垂直居中显示。

## Scope
- 在券包页 `.coupon-actions` 内对“标记为已使用”按钮增加最小化样式覆盖。
- 使用局部选择器实现 `display: flex`、`align-items: center`、`justify-content: center` 与 `line-height: normal`。

## Out of scope
- 不变更 `index.js` 或 `index.wxml` 的业务逻辑。
- 不修改其他页面或全局样式。
