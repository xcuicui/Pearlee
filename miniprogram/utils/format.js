function formatMonthDay(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike || Date.now())
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

module.exports = { formatMonthDay }
