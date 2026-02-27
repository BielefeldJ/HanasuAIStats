export interface MonthEntry {
  yearMonth: string // "YYYY-MM"
  filename: string  // e.g. "2021-09-stats.json", or "stats.json" for the current month
  label: string     // e.g. "Sep 2021"
}

export function getAllMonths(): MonthEntry[] {
  const months: MonthEntry[] = []
  const now = new Date()
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const d = new Date(2021, 8) // September 2021 (month is 0-indexed)
  while (
    d.getFullYear() < now.getFullYear() ||
    (d.getFullYear() === now.getFullYear() && d.getMonth() <= now.getMonth())
  ) {
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`
    const isCurrentMonth = yearMonth === currentYearMonth

    months.push({
      yearMonth,
      filename: isCurrentMonth ? 'stats.json' : `${yearMonth}-stats.json`,
      label: new Date(year, month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    })

    d.setMonth(d.getMonth() + 1)
  }

  return months
}

export function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}
