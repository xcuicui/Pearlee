# Design: naming-system-v1（命名系统重构）

## 1) Strings architecture
新增：
- `miniprogram/utils/strings.js`
  - export `STRINGS`（Key → 文案模板/函数）
  - export `t(key, params)`：简单模板替换（不引入 i18n 依赖）

原则：
- 所有用户可见文案从 `t()` 获取
- Key 命名大写下划线（例如 `HOME_STREAK_COPY`）

## 2) Date formatting
新增：
- `miniprogram/utils/format.js`
  - `formatMonthDay(date): "M月D日"`

## 3) Nickname fallback
新增：
- `miniprogram/utils/naming.js`
  - `fallbackMe(name): name || "我"`
  - `fallbackTa(name): name || "TA"`

## 4) UI copy landing points
### Home (miniprogram/pages/home/index.wxml)
- 顶部关系标题保持：`和 {TaNickname} 的第 {DayCount} 天`
- streak：保持，但从 strings 取文案
- 情绪卡片来源：
  - 从“来自你们 / 来自 {{emotion.from}}”替换为：
    - partner: `来自 {TaNickname} 的碎碎念`
    - me: `我写给 {TaNickname} 的碎碎念`
  - 以 `emotion.from` 或 `emotion.isMine`（若无则以 userOpenid 对比）判断；如无法判断则 fallback 为 `来自你们的碎碎念`
- FAB：不显示文字，但 aria-label 统一为 `想你的碎碎念`
- FAB 气泡暗示：在 FAB 附近展示轻量气泡文案“想你的碎碎念”（不加解释文案）

### Composer (miniprogram/pages/entry/publish.wxml)
- 标题：继续使用导航栏 title（日期）
- 新增副标题行：`{MyNickname} 的碎碎念收纳处`
- 新增提示语（轻一句）：`把想到你的那一刻，放进这里。`
- placeholder：`想到你时的碎碎念…`
- 图片入口：`+ 添一张照片`
- 主按钮：`收好`

### Day detail (miniprogram/pages/day/detail.wxml)
- 评论区 placeholder/按钮文案来自 strings
  - placeholder: `想到你，就写一句…`（复用或单独 key）
  - button: `收好`/`送出` 不合适；评论用 `回一句`（建议）——在 spec 表里定死

### Settings / Relationship
- settings 文案来自 strings：关系设置/邀请/复制邀请码/加入关系/解除关系
- relationship create/join 页同样替换为 strings（不改结构）

## 5) Layout impact
- 仅为 composer 增加两行文本（副标题 + 提示语）；其余页面仅替换文案，不做视觉大改。
