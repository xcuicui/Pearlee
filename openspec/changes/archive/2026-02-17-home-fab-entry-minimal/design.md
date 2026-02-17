# Design: Home FAB Entry (极简版)

## Insertion point
- 页面：`miniprogram/pages/home/index.wxml`
- 将原 `<view class="today card"> ... </view>` 整块删除
- 在页面根节点 `.home` 内部末尾（错误提示 `err` 之前或之后均可，但建议在 `err` 之前）插入 FAB 结构：

```xml
<view class="fab" bindtap="goPublish" hover-class="tap-down" hover-stay-time="80">
  <view class="fab-icon">+</view>
</view>
```

> 复用现有 `goPublish()` 路由逻辑；不新增文案。

## FAB visual spec (hard constraints)
- 位置：`position: fixed; right: 40rpx; bottom: calc(env(safe-area-inset-bottom) + 48rpx)`
  - 约等于 right 20px / bottom 安全区+24px
- 尺寸：`112rpx` x `112rpx`（≈56px），圆形 `border-radius: 9999rpx`
- 背景：使用现有主蓝（本项目当前用 `rgba(95,125,149,...)` 作为品牌蓝；实现用不透明 `#5F7D95` 或等效 token）
- 图标：白色“+”（不引入新资源；用文本实现）
- 层级：`z-index: 100`
- 阴影：默认不加（保持克制）；若需要可用极浅阴影但本变更先不加

## Obstruction handling
- `.home` 增加 `padding-bottom >= 192rpx`（≈96px），避免 FAB 遮挡内容或 tabbar
- 不新增任何提示文案

## Removal
- 删除 today card 后，不应留下空白模块；页面结构其余模块顺序保持：Top → Week → Emotion → (FAB)
