# Design: fix-coupons-wallet-mark-used-align-v1

## Root cause hypothesis
“标记为已使用”按钮使用全局 `btn-ghost` 样式时，在券包页上下文中可能受到默认行高与容器高度组合影响，导致文案视觉上未垂直居中。

## Design decision
- 仅在券包页 `index.wxss` 中添加局部覆盖：`.coupon-actions .btn-ghost`。
- 采用 flex 布局进行双轴居中，并将 `line-height` 设为 `normal`，避免继承行高导致偏移。

## Tradeoffs
- 该方案不改变全局按钮基类，风险最小。
- 仅作用于券包页操作区按钮，避免跨页面回归。
