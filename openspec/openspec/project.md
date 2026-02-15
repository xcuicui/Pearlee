# Project Context

## Purpose
贝忆 MVP v1.0 是一个面向情侣关系的微信小程序，用于记录每日情绪与互动，围绕“首页情绪卡片优先 + 月历点亮 + 日详情互动”构建轻量陪伴体验。

## Tech Stack
- 微信小程序（原生小程序框架，JS/WXML/WXSS）
- 腾讯云开发 CloudBase（云函数 Node.js + 云数据库）
- OpenSpec（规格驱动开发与验收）

## Project Conventions

### Directory Layout
- `miniprogram/`: 小程序端代码
- `miniprogram/pages/home/index.*`: 首页
- `miniprogram/pages/settings/index.*`: 设置页
- `miniprogram/pages/relationship/create.*`: 创建关系页
- `miniprogram/pages/relationship/join.*`: 加入关系页
- `miniprogram/pages/entry/publish.*`: 发布记录页
- `miniprogram/pages/day/detail.*`: 日详情页
- `miniprogram/utils/api.js`: 云函数调用封装
- `miniprogram/env.js`: 小程序 `envId` 和调试开关配置
- `cloudfunctions/<fn>/`: 单个云函数目录（每个函数独立部署）
- `cloudfunctions/<fn>/_shared/`: 仅该函数内可复用工具
- `openspec/specs/`: 基线规格（页面 `page-*`，函数 `fn-*`）

### Naming
- 页面规格命名：`page-<name>`
- 云函数规格命名：`fn-<name>`
- 规格路径：`openspec/specs/<name>/spec.md`

### Environment Config
- 当前环境标识配置在 `miniprogram/env.js` 的 `envId` 字段。
- 小程序与云函数必须在同一 CloudBase 环境下联调。

### Cloud Function Packaging Constraints
- 云函数打包不可依赖父目录公共代码（不能从函数目录向上层共享 import）。
- 每个函数若需复用逻辑，必须放在该函数目录下的 `_shared/`。
- 函数入口固定为 `cloudfunctions/<fn>/index.js`。

## Domain Context
- 关系模型：MVP 仅支持双人关系（`memberOpenids` 上限 2）。
- 首页优先级：情绪卡片优先展示“对方近 3 天记录”，否则从历史记录中回退展示。
- 日历点亮：按天聚合 entries，单方发布为 level=1，双方都有发布为 level=2。
- 发布记录：文本记录为主，MVP 字数上限 500。
- 点赞：按 entry + user 维度切换（toggle）。
- 评论：每条 entry 仅允许 1 条回应（MVP 约束）。
- 日详情：展示某天全部 entries 及点赞数、我是否点赞、唯一回应内容。

## Git Workflow
- 主分支：`main`
- 提交规范：Conventional Commits（如 `feat: ...`、`fix: ...`、`docs: ...`）
- 开发顺序：先更新 OpenSpec，再实现代码，再校验并提交。

## Important Constraints
- 任何功能迭代必须先有对应 spec，再进行实现。
- 偏离 spec 的实现视为缺陷，需修正规格或实现。
- 关系封存后不允许继续发布关系内新互动数据。

## External Dependencies
- 微信小程序运行时 API（`wx.*`）
- 微信云开发 SDK（`wx-server-sdk`）
- CloudBase 云数据库集合：`users`、`relationships`、`entries`、`likes`、`comments`
