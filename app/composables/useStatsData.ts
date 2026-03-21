import { getAllMonths } from '~/utils/months'

export type LanguageKey = string
export type LanguageTotals = Record<LanguageKey, number>

export interface ChannelStat {
  channel: string
  [key: string]: string | number
}

export interface RawStatsFile {
  channellist: string[]
  perChannel: ChannelStat[]
  Month: Record<string, number>
  Total: Record<string, number>
}

export interface NormalizedMonth {
  yearMonth: string
  label: string
  perChannel: Record<string, LanguageTotals>
  monthTotals: LanguageTotals
  cumulativeTotals: LanguageTotals
}

function pickLanguageKeys(record: Record<string, unknown>): string[] {
  return Object.keys(record).filter(k => /^to[A-Z]/.test(k))
}

function toLanguageLabel(lang: string): string {
  const code = lang.replace(/^to/, '').toUpperCase()
  const names: Record<string, string> = {
    JP: 'Japanese (日本語)',
    EN: 'English',
    ES: 'Spanish (Espanol)',
    FR: 'French (Francais)',
    DE: 'German (Deutsch)',
    RU: 'Russian (Russkiy)',
    ZH: 'Chinese (Zhongwen)',
    KO: 'Korean (Hangugeo)',
    IT: 'Italian (Italiano)',
    PT: 'Portuguese (Portugues)',
    NL: 'Dutch (Nederlands)',
    PL: 'Polish (Polski)',
    TR: 'Turkish (Turkce)',
    AR: 'Arabic (al-Arabiyya)',
  }
  return names[code] ?? code
}

export const useStatsData = () => {
  const months = useState<NormalizedMonth[]>('stats-months', () => [])
  const allChannels = useState<string[]>('stats-channels', () => [])
  const allLanguages = useState<LanguageKey[]>('stats-languages', () => [])
  const isLoading = useState<boolean>('stats-loading', () => false)
  const isLoaded = useState<boolean>('stats-loaded', () => false)
  const loadError = useState<string | null>('stats-error', () => null)

  const filters = useFilters()

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
      const languageSet = new Set<string>()
      const normalized: NormalizedMonth[] = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const entry = allMonthEntries[i]
        if (!result || !entry || result.status !== 'fulfilled') continue

        const raw = result.value

        pickLanguageKeys(raw.Month).forEach(k => languageSet.add(k))
        pickLanguageKeys(raw.Total).forEach(k => languageSet.add(k))

        const perChannel: Record<string, LanguageTotals> = {}
        for (const ch of raw.perChannel) {
          channelSet.add(ch.channel)
          const langTotals: LanguageTotals = {}
          for (const key of Object.keys(ch)) {
            if (key === 'channel' || !/^to[A-Z]/.test(key)) continue
            languageSet.add(key)
            const value = ch[key]
            langTotals[key] = typeof value === 'number' ? value : Number(value || 0)
          }
          perChannel[ch.channel] = langTotals
        }

        const monthTotals: LanguageTotals = {}
        const cumulativeTotals: LanguageTotals = {}
        for (const key of pickLanguageKeys(raw.Month)) {
          monthTotals[key] = Number(raw.Month[key] ?? 0)
        }
        for (const key of pickLanguageKeys(raw.Total)) {
          cumulativeTotals[key] = Number(raw.Total[key] ?? 0)
        }

        normalized.push({
          yearMonth: entry.yearMonth,
          label: entry.label,
          perChannel,
          monthTotals,
          cumulativeTotals,
        })
      }

      const languages = [...languageSet].sort()
      normalized.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))

      months.value = normalized
      allChannels.value = [...channelSet].sort()
      allLanguages.value = languages

      const preferredDefaultLanguages = ['toJP', 'toEN']
      const availablePreferred = preferredDefaultLanguages.filter(l => languages.includes(l))

      // Initialize filter selections from loaded data.
      filters.value.selectedChannels = allChannels.value.slice()
      if (filters.value.selectedLanguages.length === 0) {
        filters.value.selectedLanguages = availablePreferred.length > 0
          ? availablePreferred
          : languages.slice()
      } else {
        filters.value.selectedLanguages = filters.value.selectedLanguages.filter(l => languages.includes(l))
        if (filters.value.selectedLanguages.length === 0) {
          filters.value.selectedLanguages = availablePreferred.length > 0
            ? availablePreferred
            : languages.slice()
        }
      }

      isLoaded.value = true
      isLoading.value = false
    } catch (e: any) {
      loadError.value = e?.message ?? String(e)
      isLoading.value = false
    }
  }

  /** Months within the selected date range */
  const filteredMonths = computed(() =>
    months.value.filter(m =>
      m.yearMonth >= filters.value.startMonth &&
      m.yearMonth <= filters.value.endMonth
    )
  )

  /** Explicitly selected channels (empty = none) */
  const effectiveChannels = computed(() => filters.value.selectedChannels)

  /** Explicitly selected languages (empty = none) */
  const effectiveLanguages = computed(() => filters.value.selectedLanguages)

  /**
   * Per-month aggregated totals by language for selected channels/languages.
   * In cumulative mode, values come from file cumulative totals.
   */
  const aggregatedTimeSeries = computed(() => {
    return filteredMonths.value.map(m => {
      const byLanguage: LanguageTotals = {}

      for (const lang of effectiveLanguages.value) {
        if (filters.value.viewMode === 'cumulative') {
          byLanguage[lang] = Number(m.cumulativeTotals[lang] ?? 0)
          continue
        }

        let sum = 0
        for (const ch of effectiveChannels.value) {
          const d = m.perChannel[ch]
          if (!d) continue
          sum += Number(d[lang] ?? 0)
        }
        byLanguage[lang] = sum
      }

      const total = Object.values(byLanguage).reduce((a, b) => a + b, 0)
      return { label: m.label, byLanguage, total }
    })
  })

  /** Channels with at least one translation in selected period/languages. */
  const channelsWithData = computed(() => {
    const set = new Set<string>()
    for (const m of filteredMonths.value) {
      for (const ch of allChannels.value) {
        const d = m.perChannel[ch]
        if (!d) continue
        let sum = 0
        for (const lang of effectiveLanguages.value) {
          sum += Number(d[lang] ?? 0)
        }
        if (sum > 0) set.add(ch)
      }
    }
    return set
  })

  /** Per-channel totals across filtered months, grouped by selected languages. */
  const perChannelTotals = computed(() => {
    const map: Record<string, LanguageTotals> = {}

    for (const m of filteredMonths.value) {
      for (const ch of effectiveChannels.value) {
        const d = m.perChannel[ch]
        if (!d) continue

        if (!map[ch]) map[ch] = {}
        for (const lang of effectiveLanguages.value) {
          map[ch][lang] = Number(map[ch][lang] ?? 0) + Number(d[lang] ?? 0)
        }
      }
    }

    return Object.entries(map)
      .map(([channel, byLanguage]) => {
        const total = Object.values(byLanguage).reduce((a, b) => a + b, 0)
        return { channel, byLanguage, total }
      })
      .filter(e => e.total > 0)
      .sort((a, b) => b.total - a.total)
  })

  /** Per-month total per channel for stacked monthly chart. */
  const stackedMonthly = computed(() =>
    filteredMonths.value.map(m => {
      const channels: Record<string, number> = {}
      for (const ch of effectiveChannels.value) {
        const d = m.perChannel[ch]
        if (!d) {
          channels[ch] = 0
          continue
        }

        let sum = 0
        for (const lang of effectiveLanguages.value) {
          sum += Number(d[lang] ?? 0)
        }
        channels[ch] = sum
      }
      return { label: m.label, channels }
    })
  )

  /** Grand totals by language + combined total for summary and donut. */
  const grandTotals = computed(() => {
    const byLanguage: LanguageTotals = {}

    for (const m of filteredMonths.value) {
      for (const ch of effectiveChannels.value) {
        const d = m.perChannel[ch]
        if (!d) continue

        for (const lang of effectiveLanguages.value) {
          byLanguage[lang] = Number(byLanguage[lang] ?? 0) + Number(d[lang] ?? 0)
        }
      }
    }

    const total = Object.values(byLanguage).reduce((a, b) => a + b, 0)
    return { byLanguage, total }
  })

  const languageMeta = computed(() =>
    allLanguages.value.map(key => ({ key, label: toLanguageLabel(key) }))
  )

  return {
    months,
    allChannels,
    allLanguages,
    languageMeta,
    isLoading,
    isLoaded,
    loadError,
    loadData,
    filteredMonths,
    effectiveChannels,
    effectiveLanguages,
    aggregatedTimeSeries,
    channelsWithData,
    perChannelTotals,
    stackedMonthly,
    grandTotals,
    toLanguageLabel,
  }
}
