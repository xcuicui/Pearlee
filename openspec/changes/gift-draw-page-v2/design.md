# Design: gift-draw-page-v2

## Components
- DrawPage (`pages/lottery/index`)
  - TitleSection
  - AssetsRuleLine
  - PrimaryCTA
  - PocketList (recent 3 gifts)
  - FooterLink (to WindowDetail)
  - ResultOverlay (reuse existing ceremony overlay style; only copy changes)

- WindowDetailPage (new page)
  - TitleSection
  - GiftList (all pool items + rarity tags)

## Data Flow
- On show:
  - `rewards.refreshAssets()` -> points_balance
  - `rewards.listCoupons()` -> coupons -> derive recent3

- On draw:
  - Guard: points_balance >= 1
  - Lock UI (state=drawing)
  - Call `rewards.drawLottery()` (cloudfunction `lottery_draw`)
    - server: points_balance -1 + create coupon
  - Set resultCoupon and state=result

- On confirm:
  - Close overlay (fade-out)
  - Refresh assets + pocket list

## State Machine
`idle -> drawing -> result -> idle`

- idle: CTA enabled if points_balance >= 1
- drawing: CTA disabled; overlay visible
- result: show result card + confirm button

## Rarity Mapping
Implement as pure function `rarityFromWeight(weight)` using thresholds:
- >=15 common
- 8..14 occasional
- <8 rare

Used only for UI on WindowDetailPage; no percentages.

## Routing
- DrawPage remains `pages/lottery/index` (Tab)
- WindowDetailPage new: `pages/lottery/window/index` (or similar), registered in `miniprogram/app.json` pages.
- "查看全部" uses existing wallet page: `/pages/coupons/wallet/index`.

## Backward Compatibility
- Keep existing `lottery_draw` function name to avoid touching API plumbing.
- Result overlay uses existing classes and animations where possible (minimal diff).
