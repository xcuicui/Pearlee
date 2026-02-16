# Change: Refine Week Switching (Swiper animation + subtle arrows)

## Why
当前首页切换周为“松手后刷新”，没有滑动过渡动效；且“上周/下周”按钮点击反馈不稳定。需要在不破坏克制风格的前提下，提供丝滑的周切换体验。

## What Changes
- 周切换使用 swiper 动画：用户左右滑动时周条随手势平移过渡。
- 移除“上周/下周”文字按钮，替换为左右两侧的极淡小箭头（A 方案）。
- 交互保持：周一开始、点击某日进入日详情、切周后调用 home_feed({weekStart})。

## Impact
- Affected specs: page-home
- Affected code: miniprogram/pages/home/index.wxml, index.js, index.wxss

## Non-Goals
- 不改后端接口
- 不引入新页面/新入口
