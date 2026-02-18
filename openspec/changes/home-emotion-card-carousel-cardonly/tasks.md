# Tasks: home-emotion-card-carousel-cardonly

## Repo Scan Output
- [ ] Scan paths (emotion/home/network/cloudfunction):
  - `miniprogram/pages/home/index.wxml`
  - `miniprogram/pages/home/index.js`
  - `miniprogram/pages/home/index.wxss`
  - `miniprogram/pages/home/index.json`
  - `miniprogram/utils/api.js`
  - `cloudfunctions/home_feed/index.js`
  - `cloudfunctions/home_feed/_shared/index.js`
  - `cloudfunctions/_shared/index.js`
- [ ] Where emotion card is rendered:
  - `miniprogram/pages/home/index.wxml`: emotion block at `<view class="emotion card" ...>` with `wx:if="{{emotion.empty}}"` / `wx:else` single-card rendering.
- [ ] Where emotion data comes from:
  - `miniprogram/pages/home/index.js`: `refreshAll()` calls `api.call('home_feed', { weekStart })` and sets `emotion: res.emotion || { empty: true }`.
  - `cloudfunctions/home_feed/index.js`: `getEmotion(...)` builds emotion payload; `exports.main` returns `emotion`.
- [ ] Network layer:
  - `miniprogram/utils/api.js`: `api.call(name, data)` wraps `wx.cloud.callFunction({ name, data })` with timeout and error extraction.
- [ ] Existing card-only API availability:
  - No existing standalone card feed cloud function found in `cloudfunctions/*`.
  - Current production source is bundled `home_feed` response (`emotion` field), so a new `home_emotion_cards` API is required.

## Planned Modification Files (Minimal)
- [ ] `miniprogram/pages/home/index.js`: add `fetchCardFeed()` and card-state normalization; wire lifecycle refresh logic to card-only fetch.
- [ ] `miniprogram/pages/home/index.wxml`: replace single emotion card body with `swiper` carousel structure and dots container.
- [ ] `miniprogram/pages/home/index.wxss`: add carousel/item/dots styles; keep card shell and existing tokens.
- [ ] `miniprogram/pages/home/index.json`: enable pull-down refresh (if not already enabled) for `onPullDownRefresh` path.
- [ ] `cloudfunctions/home_emotion_cards/index.js`: new backend card-only function returning `{ ok, relationshipId, cards }`.
- [ ] `cloudfunctions/home_emotion_cards/package.json`: minimal cloud function package manifest.
- [ ] `cloudfunctions/home_emotion_cards/_shared/index.js` (optional/minimal): shared date/image helpers only if needed to avoid duplication.

## Implementation Tasks
- [ ] 1. Add card-only fetch function (frontend)
  - In `miniprogram/pages/home/index.js`, add `fetchCardFeed()` that calls `api.call('home_emotion_cards')`.
  - Normalize response to `cards` array and `activeCardIndex`; keep compatibility mapping from legacy emotion fields.
  - Keep changes minimal and avoid new dependency/module split.

- [ ] 2. Implement backend cloudfunction (card-only)
  - Create `cloudfunctions/home_emotion_cards/index.js` and `package.json`.
  - Reuse `home_feed` emotion selection semantics as baseline (0/1/multiple cards allowed), but return card list contract only.
  - Return shape: `{ ok: true, relationshipId: string, cards: CardItem[] }`; no unrelated home payload.

- [ ] 3. Update home refresh lifecycle to card-only points
  - `onLoad`: trigger `fetchCardFeed()`.
  - `onShow`: trigger `fetchCardFeed()`.
  - `onPullDownRefresh`: trigger `fetchCardFeed()` and always stop pull-down spinner in `finally`.
  - Ensure these lifecycle refreshes do not call `home_feed`.

- [ ] 4. Replace emotion card with swiper carousel + indicator rules
  - In `miniprogram/pages/home/index.wxml`, replace single-card body with `swiper` + `swiper-item` loop on `cards`.
  - Rules:
    - `cards.length === 0`: keep existing empty-state behavior.
    - `cards.length === 1`: render single card, hide indicator.
    - `cards.length > 1`: render dots below card, centered.
  - Keep tap routing behavior consistent (card -> day detail; empty -> publish).

- [ ] 5. Error handling (failure isolation)
  - `fetchCardFeed()` failure should not break relationship/week/FAB rendering.
  - Show lightweight error feedback (toast or weak inline hint), avoid full-page hard failure.
  - Preserve existing page state when card fetch fails.

- [ ] 6. Self-test checklist
  - `node --check miniprogram/pages/home/index.js`
  - `node --check cloudfunctions/home_emotion_cards/index.js`
  - Manual: open Home (onLoad/onShow) only refreshes cards via `home_emotion_cards`.
  - Manual: pull-down refresh only calls `home_emotion_cards` and spinner ends correctly.
  - Manual: `0/1/>1` cards each match rendering and indicator rules.
  - Manual: card fetch failure shows light error but other home modules remain usable.
  - Manual: no new dependencies added; changed files are minimal and scoped.
