# Change: Home FAB Entry (极简版)

## Background
当前首页存在一个底部状态卡片（today card），包含文案：
- “今天还没有留下记录” / “今天已被点亮”
以及主按钮：
- “记录这一刻”

该卡片在首页信息结构中占据较大视觉权重，且入口位置偏下、偏“模块化”，不符合极简入口目标。

## Goal
- 删除首页底部状态卡片（today card）
- 引入右下角固定悬浮 FAB 作为“记录入口”，点击后复用现有发布逻辑（进入 `/pages/entry/publish`）
- 不新增任何提示文案，不改变首页其余结构

## Non-Goals (严格禁止)
- 不改时间区/顶部关系标题
- 不改周历/切周逻辑
- 不改情绪卡片
- 不改接口/云函数/数据结构
- 不改导航栏
- 不引入新依赖
- 不新增模块/轻提示文案

## Repo Scan (evidence)
首页文件路径：
- `miniprogram/pages/home/index.wxml`
- `miniprogram/pages/home/index.js`
- `miniprogram/pages/home/index.wxss`

状态卡片位置：
- `index.wxml` 中的 `<view class="today card"> ... </view>` 区块

现有“记录入口”触发函数：
- `index.js` 中 `goPublish()`：`wx.navigateTo({ url: '/pages/entry/publish' })`

发布成功后的首页刷新逻辑：
- 首页 `onShow()` 调用 `refreshAll()`，从发布页 `navigateBack` 返回后会触发刷新
- 发布页：`miniprogram/pages/entry/publish.js` 发布成功后 `wx.navigateBack({ delta: 1 })`

## Acceptance Criteria
1) 首页不再出现“今天还没有留下记录/今天已被点亮”卡片
2) 右下角出现固定 FAB（无文字）
3) FAB 点击能进入现有发布页 `/pages/entry/publish`
4) 发布成功后返回首页会刷新（由 onShow 触发 refreshAll）
5) FAB 不遮挡 tabbar，且不遮挡页面内容（通过 padding-bottom 预留）
6) 页面无报错，无多余空白/文案
