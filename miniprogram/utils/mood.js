const { t } = require('./strings')

const MOOD_MAP = {
  1: { emoji: '🌧', label: '低落' },
  2: { emoji: '🌥', label: '平静' },
  3: { emoji: '☀', label: '温暖' },
  4: { emoji: '✨', label: '很开心' }
}

function normalizeMoodLevel(level) {
  const n = Number(level)
  if (!Number.isInteger(n) || n < 1 || n > 4) return 0
  return n
}

function moodMeta(level) {
  const n = normalizeMoodLevel(level)
  return n ? MOOD_MAP[n] : null
}

function moodOptions() {
  return [1, 2, 3, 4].map((level) => ({
    level,
    emoji: MOOD_MAP[level].emoji,
    label: MOOD_MAP[level].label,
    text: t(`MOOD_OPTION_${level}`)
  }))
}

module.exports = {
  MOOD_MAP,
  normalizeMoodLevel,
  moodMeta,
  moodOptions
}
