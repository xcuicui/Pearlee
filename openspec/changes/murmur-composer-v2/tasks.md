# Tasks: Murmur Composer V2（碎碎念发布页）

## 1) Repo scan checklist (already identified)
- Files:
  - `miniprogram/pages/entry/publish.wxml`
  - `miniprogram/pages/entry/publish.wxss`
  - `miniprogram/pages/entry/publish.js`
- Current:
  - title not date
  - count always visible
  - image header shows `图片（x/9）`
  - actions include 发布/取消

## 2) Apply (UI only)
- [ ] Title: set navigation bar title to date `M月D日` in `publish.js` onLoad/onShow
- [ ] Textarea:
  - placeholder -> "在想什么？"
  - focus=true (auto focus)
  - reduce tool/card feel via styles (lighter background, no heavy card)
- [ ] Char count:
  - implement `remaining = 500 - text.length`
  - only render count when `remaining <= 50`
- [ ] Photos entry:
  - change label to "+ 添加照片"
  - remove any `(x/9)` counters from UI
- [ ] Actions:
  - remove cancel button from WXML and `cancel()` handler if unused
  - primary button label -> "说完了"
  - disabled unless `trim(text).length > 0 || images.length > 0`
  - keep existing publish logic + loading + success navigateBack

## 3) Validation
- [ ] `openspec validate murmur-composer-v2 --strict --no-interactive`
- [ ] `node --check miniprogram/pages/entry/publish.js`

## 4) Manual self-test (acceptance)
- [ ] Title shows date
- [ ] No cancel button
- [ ] Primary button disabled when empty
- [ ] Label shows “+ 添加照片”; no image count
- [ ] Char count hidden unless remaining<=50
- [ ] Publish success: navigateBack and previous page refresh
- [ ] No layout jump / no errors

## 5) Commit
- [ ] Conventional commit: `feat(entry): murmur composer v2`
