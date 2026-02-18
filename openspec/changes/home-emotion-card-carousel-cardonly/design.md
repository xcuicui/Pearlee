# Design: Home Emotion Card Carousel (Card-Only)

## Component Structure
- `HomePage` keeps ownership of the emotion card area (no new page/module split).
- `CardCarousel` is the container component in home page card region.
- `CardItem` is the per-card render unit used by `CardCarousel`.
- No new dependency is introduced; implement with existing mini program primitives (`swiper`, `swiper-item`, current styles/tokens).

## Data Flow
- `HomePage` lifecycle (`onLoad` / `onShow` / pull-down refresh) calls `fetchCardFeed()`.
- `fetchCardFeed()` requests card-only payload from cloud function.
- Response is normalized into `state.cards`.
- `CardCarousel` reads `state.cards` and renders:
  - `0` cards: existing empty-state behavior
  - `1` card: single card, no dots
  - `>1` cards: swiper pages + dots

## Interface Choice
- Add new cloud function: `home_emotion_cards`.
- Returns only card list fields required by home card rendering.
- Reason for new interface: there is no existing standalone card feed endpoint; current `home_feed` is a bundled payload and increases coupling/failure surface for card-only refresh.

## Scroll Behavior
- Keep page vertical scroll owned by outer page `scroll-view`/page container.
- Restrict horizontal swipe handling to the card region only (`swiper` area).
- Set fixed/stable carousel height to avoid layout jump while swiping.
- Do not add full-page gesture interception; only the carousel consumes horizontal gesture.

## Indicator
- Place dots below the card body, centered in card area footer.
- Show indicator only when `cards.length > 1`.
- Use existing style tokens from home page theme (text-muted/border-muted/primary-accent family) for inactive/active dots; no hardcoded new color system.
