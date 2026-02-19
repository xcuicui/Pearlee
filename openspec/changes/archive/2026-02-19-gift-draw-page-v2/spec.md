# Spec: gift-draw-page-v2

## Scope
- 重构抽奖 Tab 页（现路径：`miniprogram/pages/lottery/index`）为新的 A~E 结构。
- 新增「橱窗详情页」：展示全部礼物 + 稀有度（常见/偶尔/稀有），不显示百分比。
- 抽奖消耗单位切换为：**贝壳 points_balance**（每次消耗 1 枚）。
- 复用现有“券包/礼物”数据结构（`coupons` collection）作为「口袋里的小礼物」。

## Page A~E Structure (Draw Tab)
A. 标题区
- 标题：`小礼物橱窗`
- 副标题：`偶尔为彼此准备一点小惊喜。`

B. 资产&规则区（合并成一句话，不做后台卡片感）
- 文案：`你有 X 枚贝壳，抽小礼物一次消耗 1 枚贝壳`
- X = `assets.points_balance`

C. 主按钮区
- 主按钮：`打开一份小礼物`
- 按钮下方小字：
  - 默认：`消耗 1 枚贝壳`
  - 余额不足（points_balance < 1）：主按钮禁用，且小字改为：`贝壳不够啦，先去收纳一点想念。`

D. 口袋里的小礼物（已抽到）
- 标题：`口袋里的小礼物`
- 展示最近 N 条：N 固定为 3
- 每条展示：礼物名 + 描述 + 获得时间
- 入口：`查看全部` → 跳转到现有券包页（`/pages/coupons/wallet/index`）
- 空态：`还没有收到小礼物`（轻量一行）

E. 底部入口
- 文案按钮：`查看小礼物橱窗`
- 跳转到新增「橱窗详情页」

## New Page: Window Detail
- 页面标题：`小礼物橱窗`
- 副标题：`这里是所有可能出现的小礼物。`
- 礼物列表：每个礼物展示名称、描述、稀有度标签（常见/偶尔/稀有）
- 禁止展示：百分比、中奖率、概率数字

## Rarity Mapping (config-driven)
- 使用奖池权重 `weight` 映射稀有度：
  - `weight >= 15` → `常见`
  - `8 <= weight < 15` → `偶尔`
  - `weight < 8` → `稀有`

该映射必须由“配置/常量”驱动，并用于橱窗详情页展示；不影响服务端抽奖权重。

## Draw Logic
- 消耗单位：`points_balance`
- 流程：
  1) 点击「打开一份小礼物」
  2) 前端校验 `points_balance >= 1`（不足则不发起请求）
  3) 服务端扣减 1 贝壳
  4) 服务端执行加权随机抽取 prize
  5) 服务端创建 coupon 实例（加入“口袋里的小礼物”）
  6) 前端展示结果卡片：
     - 标题：`你打开了一份小礼物`
     - 内容：礼物名 + 描述
     - 按钮：`收进口袋`
     - 底部小字：`已消耗 1 枚贝壳`
  7) 点击确认关闭并刷新资产与口袋列表

## Data
- `points_balance`: 来自云函数 `assets_get`
- `my_gifts`: 复用云函数 `coupons_list` 返回的 `coupons` 列表（按 obtained_at 倒序取最近 3 条）

## Backend Strategy (based on repo state)
- Repo 已存在 CloudBase 云函数 `lottery_draw`，并已实现服务端加权随机与创建 coupon。
- 本 change 将 **复用并修改** `lottery_draw`：
  - 将扣减从 `ticket_balance -1` 改为 `points_balance -1`
  - ledger 记录 `delta_points=-1`（delta_tickets=0）
  - 返回值继续包含 `coupon`，并补充最新 `points_balance`（或通过 assets_get 刷新）

## Concurrency / Idempotency
- 前端 MUST 使用 drawing/overlay lock 防连点。
- 服务端本 change 不强制实现 request_id 幂等；若后续需要，将在新 change 中通过唯一索引约束 `type=gift_draw + request_id` 实现。
