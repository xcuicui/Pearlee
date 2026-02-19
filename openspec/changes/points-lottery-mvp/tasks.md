# Tasks: points-lottery-mvp

## Repo Scan Notes (paths + purpose)

### Routing / TabBar
- `miniprogram/app.json`
  - `pages[]` 注册页面路由
  - `tabBar.list[]` 当前 2 Tab：`pages/home/index`（首页）、`pages/settings/index`（设置）

### 碎碎念发布成功回调与数据流（积分发放挂点）
- `miniprogram/pages/entry/publish.js`
  - `onSubmit()`：上传图片 → `api.call('entry_create', { text, images })` → toast → `navigateBack`
  - `entry_create` 云函数返回 `{ ok: true, id }`（可作为 `murmur` 幂等 ref_id）
- `cloudfunctions/entry_create/index.js`
  - 落库 `entries`，并返回 `res._id` 作为 entry id

### 用户体系 / space / 情侣绑定（关系域）
- `cloudfunctions/ctx_get/index.js`
  - 通过 OPENID 查询未封存 relationship，并返回 `relationship` + member nickname（me/partner）
- `cloudfunctions/relationship_*/*` 与 `cloudfunctions/couple_*/*`
  - 关系创建/加入/更新/封存相关逻辑
- DB 关键集合（见 db_init）：`relationships`、`relationship_members`、`relationship_stats`

### 存储与后端形态
- `cloudfunctions/*`
  - 项目为 CloudBase 云函数 + 云数据库（非纯本地）
- `cloudfunctions/db_init/index.js`
  - 初始化/校验集合与索引的幂等工具函数

### 是否已有“设置/我的”页面可放券包
- `miniprogram/pages/settings/index.(wxml|js|wxss)`
  - 现为关系设置 + 邀请 + 封存；适合新增「我的券包」入口

### 网络层封装
- `miniprogram/utils/api.js`
  - 统一 `wx.cloud.callFunction({ name, data })` + timeout + 错误提取
- `miniprogram/utils/strings.js`
  - 集中管理 UI 文案（新增文案需加入 STRINGS）

---

## 1. Specs-to-Code Setup（后端优先 + 可回滚）

- [ ] 1.1 为 rewards 相关集合补齐 `db_init`：新增 `user_assets/point_ledger/coupons` 与必要索引（按 spec）
- [ ] 1.2 新增云函数目录骨架与共享工具：
  - `cloudfunctions/_shared` 复用的 `BizError/now/dayKey`（若已存在则复用，不跨云函数 require）
  - 约定统一返回形态 `{ ok: true, ... }`

## 2. Cloud Functions（资产/发放/打卡/兑换/抽奖/券包）

- [ ] 2.1 `assets_get`：读取/懒创建 `user_assets`；返回余额与券统计（unused/used）
- [ ] 2.2 `points_earn`：实现碎碎念得贝壳规则（字数档位 + 图片档位 + cap=16），并写入 `point_ledger`（幂等：type+ref_id unique）
- [ ] 2.3 `checkin`：按 `dayKey(now)` 判定自然日，首次 +3 贝壳；写入 ledger（幂等）
- [ ] 2.4 `tickets_exchange`：10 贝壳 → 1 抽奖券；余额不足报错；写入 ledger
- [ ] 2.5 `lottery_draw`：消耗 1 抽奖券；按权重随机；生成 `coupons`（status=unused）；写入 ledger
- [ ] 2.6 `coupons_list`：返回券包列表（按 obtained_at desc）
- [ ] 2.7 `coupons_use`：标记已使用（幂等），校验归属关系/用户

## 3. Frontend: 文案与通用状态

- [ ] 3.1 在 `miniprogram/utils/strings.js` 新增贝壳/打卡/抽奖/券包相关文案 keys（温柔陪伴 + 收纳语气；禁博彩词）
- [ ] 3.2 增加轻量 assets 状态封装（store/service）：
  - 统一 `refreshAssets()` 调 `assets_get`
  - 提供 `getPoints/getTickets` 等读方法（MVP 可直接用 page data，但需避免散落重复调用）

## 4. Frontend: 发布成功发放贝壳

- [ ] 4.1 修改 `miniprogram/pages/entry/publish.js`：
  - `entry_create` 成功拿到 `id` 后调用 `points_earn({ type:"murmur", ref_id:id, content_len, image_count })`
  - 返回 `earned_points` 时 toast：`收纳成功 +X 贝壳`
  - 发放失败不阻断 `navigateBack`
- [ ] 4.2 自测：同一 entry id 重复触发不重复得分（幂等）

## 5. Frontend: 首页「想念打卡」入口

- [ ] 5.1 修改 `miniprogram/pages/home/index.(wxml|js|wxss)`：新增小 pill，不破坏现有结构
- [ ] 5.2 接入 `checkin()`：首次成功 toast `今天的想念已收纳 +3 贝壳`；刷新 assets
- [ ] 5.3 状态：已打卡显示「今天已想你」且禁用

## 6. Frontend: 新增 Tab「抽奖」页

- [ ] 6.1 修改 `miniprogram/app.json`：TabBar 新增 `pages/lottery/index`，Tab 文案固定 `抽奖`
- [ ] 6.2 新增页面 `miniprogram/pages/lottery/index.(wxml|js|wxss|json)`：
  - 顶部展示贝壳/抽奖券余额 + 兑换按钮
  - 中部抽奖按钮「抽一次」
  - 下部奖池展示（静态列表）+ 「我的券包」入口
- [ ] 6.3 兑换：接入 `tickets_exchange({ count: 1 })`，成功后刷新余额
- [ ] 6.4 抽奖：接入 `lottery_draw({ count: 1 })`，结果弹窗温柔语气，成功后刷新余额
- [ ] 6.5 无券态：禁用「抽一次」，提示 `先去兑换抽奖券`

## 7. Frontend: 券包页（小心愿券）

- [ ] 7.1 新增页面 `miniprogram/pages/coupons/wallet/index.(wxml|js|wxss|json)`：列表展示名称/描述/时间/状态
- [ ] 7.2 标记使用：二次确认 → `coupons_use({ id })` → 刷新/更新单项状态
- [ ] 7.3 设置页增加「我的券包」入口跳转到券包页

## 8. Self-test & Validation

- [ ] 8.1 逐条按验收标准自测（含边界：0 字有图、>200 字、4~9 图、cap=16、无贝壳兑换、无券抽奖）
- [ ] 8.2 `openspec validate points-lottery-mvp --strict --no-interactive`（proposal/specs/design/tasks 完整）
- [ ] 8.3 部署说明：新增云函数需在微信开发者工具逐个“上传并部署（云端安装依赖）”
