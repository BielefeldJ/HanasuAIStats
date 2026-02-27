import { getAllMonths } from '~/utils/months'

export interface ChannelStat {
  channel: string
  toJP: number
  toEN: number
}

export interface RawStatsFile {
  channellist: string[]
  perChannel: ChannelStat[]
  Month: { toJP: number; toEN: number }
  Total: { toJP: number; toEN: number }
}

export interface NormalizedMonth {
  yearMonth: string
  label: string
  perChannel: Record<string, { toJP: number; toEN: number }>
  monthTotals: { toJP: number; toEN: number }
  cumulativeTotals: { toJP: number; toEN: number }
}

export const useStatsData = () => {
  const months      = useState<NormalizedMonth[]>('stats-months',   () => [])
  const allChannels = useState<string[]>          ('stats-channels', () => [])
  const isLoading   = useState<boolean>           ('stats-loading',  () => false)
  const isLoaded    = useState<boolean>           ('stats-loaded',   () => false)
  const loadError   = useState<string | null>     ('stats-error',    () => null)

  async function loadData() {
    if (isLoaded.value || isLoading.value) return
    isLoading.value = true
    loadError.value = null

    try {
    const allMonthEntries = getAllMonths()

    const results = await Promise.allSettled(
      allMonthEntries.map(entry => $fetch<RawStatsFile>(`/stats/${entry.filename}`))
    )

    const channelSet = new Set<string>()
    const normalized: NormalizedMonth[] = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const entry  = allMonthEntries[i]
      if (!result || !entry || result.status !== 'fulfilled') continue

      const raw = result.value
      const perChannel: Record<string, { toJP: number; toEN: number }> = {}

      for (const ch of raw.perChannel) {
        channelSet.add(ch.channel)
        perChannel[ch.channel] = { toJP: ch.toJP, toEN: ch.toEN }
      }

      normalized.push({
        yearMonth:        entry.yearMonth,
        label:            entry.label,
        perChannel,
        monthTotals:      { toJP: raw.Month.toJP, toEN: raw.Month.toEN },
        cumulativeTotals: { toJP: raw.Total.toJP, toEN: raw.Total.toEN },
      })
    }

    normalized.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
    months.value      = normalized
    allChannels.value = [...channelSet].sort()
    // Initialise channel selection to all channels on first load
    filters.value.selectedChannels = allChannels.value.slice()
    isLoaded.value    = true
    isLoading.value   = false
    } catch (e: any) {
      loadError.value = e?.message ?? String(e)
      isLoading.value = false
    }
  }

  const filters = useFilters()

  /** Months within the selected date range */
  const filteredMonths = computed(() =>
    months.value.filter(m =>
      m.yearMonth >= filters.value.startMonth &&
      m.yearMonth <= filters.value.endMonth
    )
  )

  /** Effective channel list: whatever is explicitly selected (empty = none) */
  const effectiveChannels = computed(() => filters.value.selectedChannels)

  /**
   * Per-month aggregated totals (sum over effective channels) for JP, EN and total.
   * Respects viewMode: 'monthly' uses monthTotals, 'cumulative' uses cumulativeTotals.
   */
  const aggregatedTimeSeries = computed(() => {
    return filteredMonths.value.map(m => {
      const channels = effectiveChannels.value
      if (filters.value.viewMode === 'cumulative') {
        // Use the file's own cumulative totals (already pre-computed in the file)
        return {
          label: m.label,
          toJP:  m.cumulativeTotals.toJP,
          toEN:  m.cumulativeTotals.toEN,
        }
      }
      // Monthly: sum across effective channels
      let jp = 0
      let en = 0
      for (const ch of channels) {
        const d = m.perChannel[ch]
        if (d) { jp += d.toJP; en += d.toEN }
      }
      return { label: m.label, toJP: jp, toEN: en }
    })
  })

  /**
   * Per-channel totals aggregated across all filtered months.
   * Sorted descending by total (JP + EN).
   */
  const perChannelTotals = computed(() => {
    const map: Record<string, { toJP: number; toEN: number }> = {}
    for (const m of filteredMonths.value) {
      for (const ch of effectiveChannels.value) {
        const d = m.perChannel[ch]
        if (!d) continue
        if (!map[ch]) map[ch] = { toJP: 0, toEN: 0 }
        map[ch].toJP += d.toJP
        map[ch].toEN += d.toEN
      }
    }
    return Object.entries(map)
      .map(([channel, v]) => ({ channel, ...v, total: v.toJP + v.toEN }))
      .sort((a, b) => b.total - a.total)
  })

  /**
   * Per-month per-channel data for the stacked bar chart.
   */
  const stackedMonthly = computed(() =>
    filteredMonths.value.map(m => {
      const channels: Record<string, number> = {}
      for (const ch of effectiveChannels.value) {
        const d = m.perChannel[ch]
        channels[ch] = d ? d.toJP + d.toEN : 0
      }
      return { label: m.label, channels }
    })
  )

  /**
   * Grand totals for the summary row.
   * Always sums monthly per-channel values so the total is correct
   * regardless of whether cumulative or monthly view mode is active.
   */
  const grandTotals = computed(() => {
    let toJP = 0, toEN = 0
    for (const m of filteredMonths.value) {
      for (const ch of effectiveChannels.value) {
        const d = m.perChannel[ch]
        if (d) { toJP += d.toJP; toEN += d.toEN }
      }
    }
    return { toJP, toEN, total: toJP + toEN }
  })

  return {
    months,
    allChannels,
    isLoading,
    isLoaded,
    loadError,
    loadData,
    filteredMonths,
    effectiveChannels,
    aggregatedTimeSeries,
    perChannelTotals,
    stackedMonthly,
    grandTotals,
  }
}
