const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function formatBulanLabel(bulan) {
  const [year, month] = String(bulan || '').split('-')
  if (!year || !month) return bulan
  return `${MONTHS_ID[Number(month) - 1] || month} ${year}`
}

export function aggregateTrend(data, period) {
  const items = Array.isArray(data) ? data : []

  if (!items.length) return items

  if (period !== 'kuartalan' && period !== 'tahunan') {
    return items.map((d) => ({ ...d, label: formatBulanLabel(d.bulan) || d.label }))
  }

  const map = new Map()

  for (const d of items) {
    const [year, month] = String(d.bulan || '').split('-')
    const key = period === 'kuartalan'
      ? `Q${Math.floor((Number(month) - 1) / 3) + 1} ${year}`
      : year

    const entry = map.get(key) || { label: key, total: 0 }
    entry.total += Number(d.total) || 0
    map.set(key, entry)
  }

  return [...map.values()]
}
