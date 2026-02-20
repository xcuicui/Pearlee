# Change: add-ui-tap-guard-debounce-v1 (按钮防抖 / 防重复提交)

## Why
当前多处页面按钮/入口缺少防抖与防重复提交机制：
- 容易因连点触发重复云函数调用（创建重复、扣积分重复、状态错乱）
- 弱网或卡顿时用户更倾向多次点击，放大问题

## What Changes
- 提供一个统一的客户端防抖/防重复提交机制（tap guard）：
  - 同一 action 在短时间内仅允许一次触发（debounce window）
  - 对异步提交类 action：在 promise 完成前锁定（in-flight lock）
- 在关键路径入口/按钮上应用该机制（发布/创建/删除/完成/保存等）

## Non-Goals
- 不改云函数幂等逻辑（后端幂等仍建议保留，但不在本 change 内）
- 不引入第三方库

## Impact
- Affected specs (new): client-ui-tap-guard
- Affected code (expected):
  - miniprogram/utils/** (新增 util)
  - 多个页面的 bindtap handlers（逐步接入）

## Risks
- 过度防抖可能让用户觉得“点了没反应”
- 需要明确哪些 action 用短防抖、哪些用 in-flight lock

## Rollback
- util 兼容旧写法；逐点回退到原 handler 即可
