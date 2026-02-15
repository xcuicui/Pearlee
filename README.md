# 贝忆 MVP v1.0（beiyi-mvp-miniprogram）

微信小程序 + 云开发（CloudBase）实现。

- envId: cloud1-5gaitim7793bed6f
- Tab：2 个（首页 / 设置）

---

## Spec-driven development（强制准则）

从现在开始，本项目 **只接受 spec 编程** 的方式迭代：

1) **先写规格（Spec）**：用 `openspec` 创建/更新规格文件
2) **再实现代码**：用 Codex（或 OpenClaw 内的 Codex 模式）按规格实现
3) **每个新功能必须可验收**：规格里写清楚行为/边界/验收点（Scenario/Requirements）

### Spec 目录约定
- 项目规格根目录：`openspec/`
- 项目上下文（全局约束）：`openspec/openspec/project.md`
- 工作流说明（给开发/AI）：`openspec/AGENTS.md`、`openspec/openspec/AGENTS.md`

> 说明：`openspec init openspec` 会生成上面这种目录结构。

### 工作流（所有开发同学都要遵守）
1. 初始化/更新 OpenSpec 指令（首次已做）：
   - `openspec init openspec`
   - 以后升级：`openspec update`

2. 写清项目上下文：
   - 先完善 `openspec/openspec/project.md`

3. 每个功能用 Change Proposal 驱动：
   - `openspec change ...`（创建变更提案）
   - 在 change 中拆分：数据结构 / 云函数接口 / 小程序页面 / 验收

4. 实现时严格对照 spec：
   - 任何偏离 spec 的实现都视为 bug（要么改 spec，要么改实现）

5. 完成后归档：
   - `openspec archive ...`（归档变更并更新主 specs）

---

## 本地结构
- `miniprogram/` 小程序端
- `cloudfunctions/` 云函数
- `openspec/` 规格与变更

## 初始化
1. 微信开发者工具打开本项目（根目录）
2. 配置云开发环境 envId
3. 右键 `cloudfunctions/db_init` 上传并部署（云端安装依赖）
4. 在云函数面板运行 `db_init`（创建集合 + 索引）

## 主要云函数
- `ctx_get`：获取当前用户关系上下文
- `relationship_create` / `relationship_join` / `relationship_update` / `relationship_archive`
- `home_feed`：首页数据（情绪卡片 + 月历点亮 + 今日状态）
- `entry_create`：发布记录
- `day_entries`：某天详情（entries + likes + comment）
- `like_toggle`
- `comment_set`（每条 entry 仅 1 条回应）
