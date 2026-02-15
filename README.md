# 贝忆 MVP v1.0（beiyi-mvp-miniprogram）

微信小程序 + 云开发（CloudBase）实现。

- envId: cloud1-5gaitim7793bed6f
- Tab：2 个（首页 / 设置）

## 本地结构
- `miniprogram/` 小程序端
- `cloudfunctions/` 云函数

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
