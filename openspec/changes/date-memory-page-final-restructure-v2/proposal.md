# Change: date-memory-page-final-restructure-v2 (约会日记页 → 回忆页重构)

## 背景
当前「约会日记页」结构更像信息录入表单（关联清单/时间/文本/图片/按钮），语气与布局偏工具化，不符合产品定位：
- 这是关系空间
- 是可翻阅的一页回忆
- 是未来可以重温的时刻

## 目标
把页面从“功能表单”升级为“手帐式回忆页”，仅做 **UI 结构重构与文案升级**：
- 强化“书页感/回忆感”而不抢焦点
- 图片优先展示
- 关联清单降级（从顶部移到底部）
- 底部 CTA 改为仪式动作

## 非目标
- 不改数据模型
- 不改云函数入参/出参（保持 `date_diary_create` 逻辑不变）
- 不改约会清单功能/数据结构

## 风险
- 用户对旧表单式布局有使用习惯，改版后需要适应
- 视觉层级调整不当可能导致“找不到发生时间/关联清单”

## 回滚
- 保留旧布局作为代码内开关（实现时保留旧组件片段，或通过常量 `USE_MEMORY_LAYOUT` 切换）

## 影响范围
- Affected spec (delta): page-date-diary-create
- Affected code:
  - miniprogram/pages/date/diary-create/index.wxml
  - miniprogram/pages/date/diary-create/index.wxss
  - miniprogram/pages/date/diary-create/index.js（仅 UI/文案/布局交互，不改提交参数与数据模型）
  - miniprogram/pages/date/diary-create/index.json（导航标题可选调整）
