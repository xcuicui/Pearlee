# Tasks: Home FAB Entry (极简版)

## 1) Locate
- [ ] Confirm home page files:
  - `miniprogram/pages/home/index.wxml`
  - `miniprogram/pages/home/index.wxss`
  - `miniprogram/pages/home/index.js`
- [ ] Confirm existing publish entry trigger: `goPublish()` routes to `/pages/entry/publish`

## 2) Apply UI changes (minimal)
- [ ] Remove today status card block from `index.wxml`:
  - delete `<view class="today card"> ... </view>`
  - ensure no leftover text/button: “今天还没有留下记录/今天已被点亮/记录这一刻”
- [ ] Add FAB markup to `index.wxml` (no text label):
  - fixed right-bottom
  - bindtap `goPublish`
- [ ] Add FAB styles to `index.wxss`:
  - 56x56px circle (112rpx)
  - background: primary blue
  - icon: white
  - z-index: 100
  - bottom uses safe-area inset
- [ ] Add bottom padding to `.home` (>=96px)

## 3) Self-check
- [ ] `node --check miniprogram/pages/home/index.js` (syntax)
- [ ] Manual: Home page renders with FAB; no today card
- [ ] Manual: Click FAB navigates to publish page
- [ ] Manual: Publish then navigateBack triggers home onShow refresh
- [ ] Manual: FAB does not block tabbar or content

## 4) OpenSpec validation
- [ ] `openspec validate home-fab-entry-minimal --strict --no-interactive`

## 5) Commit
- [ ] Commit message: `feat(home): replace today card with entry FAB` (or equivalent)
