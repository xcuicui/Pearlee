## ADDED Requirements

### Requirement: Tap debounce window
客户端 MUST 对高频入口点击提供短时间防抖，避免连点触发重复动作。

#### Scenario: Guard tap within window
- **GIVEN** 某个入口使用 tap guard 且 windowMs=600
- **WHEN** 用户在 600ms 内连续点击两次
- **THEN** 仅触发一次 handler

### Requirement: In-flight lock for async actions
客户端 MUST 对异步提交/删除等写操作提供 in-flight 锁，避免重复请求。

#### Scenario: Async action ignored while in-flight
- **GIVEN** 某按钮触发云函数写操作，并使用 async guard
- **WHEN** 用户在第一次请求未完成前再次点击
- **THEN** 第二次点击不触发新的请求

#### Scenario: Retry allowed after failure
- **GIVEN** 第一次请求失败返回错误
- **WHEN** 用户再次点击
- **THEN** 允许再次触发请求

### Requirement: No noisy toasts on debounce
防抖/锁定期间客户端 MUST 不弹出额外的“请勿频繁点击”等 toast（避免打断氛围）。

#### Scenario: No toast
- **WHEN** 点击被 guard 拦截
- **THEN** 不弹出 toast
