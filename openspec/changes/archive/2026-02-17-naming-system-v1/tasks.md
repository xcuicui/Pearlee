# Tasks: naming-system-v1

## 0) Scan summary (repo evidence)
Pages found in this repo:
- Home: `miniprogram/pages/home/index.(wxml|js|wxss)`
- Composer: `miniprogram/pages/entry/publish.(wxml|js|wxss)`
- Day detail: `miniprogram/pages/day/detail.(wxml|js|wxss)`
- Settings: `miniprogram/pages/settings/index.(wxml|js|wxss)`
- Relationship pages:
  - `miniprogram/pages/relationship/create.(wxml|js|wxss)`
  - `miniprogram/pages/relationship/join.(wxml|js|wxss)`

Not found:
- No mini-program pages for “约会模块” in this repo (only `cloudfunctions/date_*`).

Existing strings system:
- No i18n/strings/constants layer found (only `miniprogram/utils/api.js`).

## 1) Add centralized strings + utils
- [ ] Add `miniprogram/utils/strings.js`
  - `STRINGS` keys and `t(key, params)`
- [ ] Add `miniprogram/utils/format.js` with `formatMonthDay(date)`
- [ ] Add `miniprogram/utils/naming.js` with nickname fallback helpers

## 2) Home copy refactor
Files:
- `miniprogram/pages/home/index.wxml`
- `miniprogram/pages/home/index.js`

Tasks:
- [ ] Replace hard-coded streak copy with strings key
- [ ] Replace emotion empty copy:
  - “现在” / “写一句给对方的话吧。” / “来自你们” → strings
- [ ] Replace emotion from line:
  - “来自 {{emotion.from}}” → naming-system variants
- [ ] FAB aria-label:
  - "new entry" → strings key `FAB_MURMUR_ENTRY_NAME` (想你的碎碎念)
- [ ] FAB bubble hint:
  - 在 FAB 附近添加轻量气泡文案（来自 strings key），文案“想你的碎碎念"

## 3) Composer copy refactor
Files:
- `miniprogram/pages/entry/publish.wxml`
- `miniprogram/pages/entry/publish.js`

Tasks:
- [ ] Add subtitle line under input top: `{MyNickname} 的碎碎念收纳处` (strings + nickname fallback)
- [ ] Add hint line: `把想到你的那一刻，放进这里。`
- [ ] Placeholder: `想到你时的碎碎念…`
- [ ] Image entry label: `+ 添一张照片`
- [ ] Submit button label: `收好`

## 4) Day detail copy refactor
Files:
- `miniprogram/pages/day/detail.wxml`
- `miniprogram/pages/day/detail.js`

Tasks:
- [ ] Replace comment tag “回应” with strings key
- [ ] Replace comment composer placeholder "写点什么再发送" with strings key
- [ ] Replace comment button "发送" with strings key (suggest: "回一句")
- [ ] Replace load more "加载更多" and toasts (best-effort)

## 5) Settings + Relationship pages
Files:
- `miniprogram/pages/settings/index.wxml`
- `miniprogram/pages/settings/index.js` (if needed)
- `miniprogram/pages/relationship/create.wxml`
- `miniprogram/pages/relationship/join.wxml`

Tasks:
- [ ] Replace key user-visible strings to `t()`

## 6) Self-check
- [ ] `openspec validate naming-system-v1 --strict --no-interactive`
- [ ] `node --check` for modified page js files
- [ ] Quick manual check: no obvious hard-coded Chinese left in covered pages (except data)

## 7) Apply stage instructions
- [ ] Run `openspec instructions apply naming-system-v1` and follow in order
