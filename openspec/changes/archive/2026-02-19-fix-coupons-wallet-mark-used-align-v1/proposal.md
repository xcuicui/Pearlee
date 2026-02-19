# Proposal: fix-coupons-wallet-mark-used-align-v1

## Background
券包页中“标记为已使用”按钮文案在部分设备上存在垂直方向偏移，影响可读性与视觉一致性。

## Goals
- 修复券包页“标记为已使用”按钮文案垂直居中问题。
- 仅在券包页局部样式覆盖，不影响其他页面按钮表现。

## Non-goals
- 不改动券包页交互逻辑与数据逻辑。
- 不改动全局按钮样式定义。

## Impact
- Affected specs: `page-coupons-wallet`
- Affected code:
  - `miniprogram/pages/coupons/wallet/index.wxss`
