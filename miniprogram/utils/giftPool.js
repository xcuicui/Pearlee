const { t } = require('./strings')

const GIFT_POOL = [
  { prize_key: 'coffee', titleKey: 'REWARDS_PRIZE_COFFEE_TITLE', descKey: 'REWARDS_PRIZE_COFFEE_DESC', weight: 20 },
  { prize_key: 'milk_tea', titleKey: 'REWARDS_PRIZE_MILK_TEA_TITLE', descKey: 'REWARDS_PRIZE_MILK_TEA_DESC', weight: 20 },
  { prize_key: 'hangout', titleKey: 'REWARDS_PRIZE_HANGOUT_TITLE', descKey: 'REWARDS_PRIZE_HANGOUT_DESC', weight: 15 },
  { prize_key: 'play', titleKey: 'REWARDS_PRIZE_PLAY_TITLE', descKey: 'REWARDS_PRIZE_PLAY_DESC', weight: 15 },
  { prize_key: 'sing', titleKey: 'REWARDS_PRIZE_SING_TITLE', descKey: 'REWARDS_PRIZE_SING_DESC', weight: 10 },
  { prize_key: 'wish', titleKey: 'REWARDS_PRIZE_WISH_TITLE', descKey: 'REWARDS_PRIZE_WISH_DESC', weight: 5 },
  { prize_key: 'hug', titleKey: 'REWARDS_PRIZE_HUG_TITLE', descKey: 'REWARDS_PRIZE_HUG_DESC', weight: 15 }
]

function rarityFromWeight(weight) {
  const w = Number(weight || 0)
  if (w >= 15) return 'common'
  if (w >= 8) return 'occasional'
  return 'rare'
}

function rarityTextFromWeight(weight) {
  const rarity = rarityFromWeight(weight)
  if (rarity === 'common') return t('REWARDS_RARITY_COMMON')
  if (rarity === 'occasional') return t('REWARDS_RARITY_OCCASIONAL')
  return t('REWARDS_RARITY_RARE')
}

function getGiftPool() {
  return GIFT_POOL.map(item => ({
    prize_key: item.prize_key,
    title: t(item.titleKey),
    desc: t(item.descKey),
    weight: Number(item.weight || 0)
  }))
}

function getGiftPoolWithRarity() {
  return getGiftPool().map(item => ({
    ...item,
    rarityText: rarityTextFromWeight(item.weight)
  }))
}

module.exports = {
  GIFT_POOL,
  rarityFromWeight,
  rarityTextFromWeight,
  getGiftPool,
  getGiftPoolWithRarity
}
