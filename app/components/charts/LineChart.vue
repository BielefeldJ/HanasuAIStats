<script setup lang="ts">
import { Line } from 'vue-chartjs'

function languageColor(language: string, alpha = 1): string {
  let hash = 0
  for (let i = 0; i < language.length; i++) {
    hash = language.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const h = Math.abs(hash) % 360
  const s = 62 + (Math.abs(hash >> 8) % 18)
  const l = 52 + (Math.abs(hash >> 16) % 10)
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}

const { aggregatedTimeSeries, languageMeta } = useStatsData()
const filters = useFilters()

const languageLabels = computed(() => {
  const map = new Map<string, string>(
    languageMeta.value.map((l: { key: string; label: string }) => [l.key, l.label])
  )
  return map
})

const chartKey = computed(() =>
  filters.value.selectedChannels.join() +
  filters.value.selectedLanguages.join() +
  filters.value.startMonth + filters.value.endMonth +
  filters.value.viewMode
)

const chartData = computed(() => {
  const series = aggregatedTimeSeries.value
  const labels = series.map((s: { label: string }) => s.label)

  const datasets = filters.value.selectedLanguages.map(lang => ({
    label: `→ ${languageLabels.value.get(lang) ?? lang}`,
    data: series.map((s: { byLanguage: Record<string, number> }) => Number(s.byLanguage[lang] ?? 0)),
    borderColor: languageColor(lang, 1),
    backgroundColor: languageColor(lang, 0.18),
    fill: true,
    tension: 0.35,
    pointRadius: series.length > 30 ? 0 : 3,
    pointHoverRadius: 6,
  }))

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      labels: { color: '#c8c8e8', padding: 16, font: { size: 12 } },
    },
    tooltip: {
      backgroundColor: '#12122a',
      titleColor: '#f0f0ff',
      bodyColor: '#c8c8e8',
      borderColor: '#2a2a50',
      borderWidth: 1,
      callbacks: {
        label: (ctx: any) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(100, 100, 200, 0.1)' },
      ticks: { color: '#7070a0', maxRotation: 45, autoSkip: true, maxTicksLimit: 18 },
    },
    y: {
      grid: { color: 'rgba(100, 100, 200, 0.1)' },
      ticks: {
        color: '#7070a0',
        callback: (v: any) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v,
      },
    },
  },
}
</script>

<template>
  <Line :key="chartKey" :data="chartData" :options="chartOptions" />
</template>
