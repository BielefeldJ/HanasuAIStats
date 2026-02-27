export type Language = 'toJP' | 'toEN'
export type ViewMode = 'monthly' | 'cumulative'

export interface StatsFilters {
  selectedChannels: string[]
  selectedLanguages: Language[]
  startMonth: string // "YYYY-MM"
  endMonth: string   // "YYYY-MM"
  viewMode: ViewMode
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const useFilters = () => {
  return useState<StatsFilters>('stats-filters', () => ({
    selectedChannels: [],
    selectedLanguages: ['toJP', 'toEN'],
    startMonth: '2021-09',
    endMonth: currentYearMonth(),
    viewMode: 'monthly',
  }))
}
