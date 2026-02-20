## Context
小程序端的 bindtap 很容易被连点触发多次。需要一个统一机制，既解决“短时间连点”也解决“异步请求未完成时重复提交”。

## Goals
- 同一 action 的连点在短窗口内只触发一次（debounce window）
- 异步 action 在 promise 完成前锁定（in-flight lock）
- 失败后允许重试
- 不侵入页面结构：改 handler 包装即可

## Non-Goals
- 不做全局手势拦截
- 不替代后端幂等

## Proposed API
新增 `miniprogram/utils/tapGuard.js`：

### 1) guardTap(key, fn, options?)
用于同步/轻操作（路由、展开/收起等）：
- key: string（建议 `page:action`）
- windowMs: 默认 600ms

### 2) guardAsync(key, fnAsync, options?)
用于提交/删除/支付等异步操作：
- 同一 key 在 in-flight 期间直接忽略
- 可选：同时加 windowMs（防止快速连点触发两次进入 in-flight）

### 3) withLoading(flagName?)（可选）
帮助页面统一设置 loading/disabled 状态（如果页面已有 loading state，就不强制）

## Rules
- 路由类：`guardTap`，windowMs=500~800ms
- 提交/删除类：`guardAsync`（in-flight lock）
- 对会触发云函数写操作的一律使用 `guardAsync`

## UX notes
- 防抖期间不弹 toast（避免噪音）
- in-flight 时按钮应有 loading/disabled 视觉反馈（由页面已有 loading 字段或新增）

## Rollback
- 逐点移除 wrapper 即可
