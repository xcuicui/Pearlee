function pad2(n) { return String(n).padStart(2, '0') }
function keyOf(y, m, d) { return `${y}-${pad2(m)}-${pad2(d)}` }

function buildCells(year, month, marks) {
  const first = new Date(year, month - 1, 1)
  const startDow = first.getDay() // 0 Sun
  const daysInMonth = new Date(year, month, 0).getDate()

  // show 6 rows = 42 cells
  const cells = []

  // previous month
  const prevDays = new Date(year, month - 1, 0).getDate()
  for (let i = 0; i < startDow; i++) {
    const day = prevDays - (startDow - 1 - i)
    const pm = month - 1 <= 0 ? 12 : month - 1
    const py = month - 1 <= 0 ? year - 1 : year
    const k = keyOf(py, pm, day)
    cells.push({
      key: k,
      day,
      isCurrentMonth: false,
      mark: marks && marks[k] ? marks[k] : null
    })
  }

  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const k = keyOf(year, month, d)
    cells.push({
      key: k,
      day: d,
      isCurrentMonth: true,
      mark: marks && marks[k] ? marks[k] : null
    })
  }

  // next month fill
  while (cells.length < 42) {
    const idx = cells.length - (startDow + daysInMonth)
    const day = idx + 1
    const nm = month + 1 >= 13 ? 1 : month + 1
    const ny = month + 1 >= 13 ? year + 1 : year
    const k = keyOf(ny, nm, day)
    cells.push({
      key: k,
      day,
      isCurrentMonth: false,
      mark: marks && marks[k] ? marks[k] : null
    })
  }

  return cells
}

Component({
  properties: {
    year: { type: Number, value: 2026 },
    month: { type: Number, value: 1 },
    marks: { type: Object, value: {} }
  },

  data: {
    dows: ['日', '一', '二', '三', '四', '五', '六'],
    cells: []
  },

  observers: {
    'year,month,marks': function (y, m, marks) {
      this.setData({ cells: buildCells(y, m, marks || {}) })
    }
  },

  methods: {
    onSelect(e) {
      const key = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.key : ''
      if (!key) return
      this.triggerEvent('select', { key })
    }
  }
})
