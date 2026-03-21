<script setup lang="ts">
import { Bar } from 'vue-chartjs'

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

const { perChannelTotals, languageMeta } = useStatsData()
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
  filters.value.startMonth + filters.value.endMonth
)

const chartData = computed(() => {
  const entries = perChannelTotals.value
  const labels = entries.map((e: { channel: string }) => e.channel)

  const datasets = filters.value.selectedLanguages.map(lang => ({
    label: `→ ${languageLabels.value.get(lang) ?? lang}`,
    data: entries.map((e: { byLanguage: Record<string, number> }) => Number(e.byLanguage[lang] ?? 0)),
    backgroundColor: languageColor(lang, 0.7),
    borderColor: languageColor(lang, 1),
    borderWidth: 1,
    stack: 'total',
  }))

  return { labels, datasets }
})

const chartHeight = computed(() => Math.max(240, perChannelTotals.value.length * 36 + 60))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      labels: { color: '#c8c8e8', font: { size: 12 } },
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
      stacked: true,
      grid: { color: 'rgba(100, 100, 200, 0.1)' },
      ticks: {
        color: '#7070a0',
        callback: (v: any) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v,
      },
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(100, 100, 200, 0.06)' },
      ticks: { color: '#c8c8e8', font: { size: 11 }, autoSkip: false },
    },
  },
}
</script>

<template>
  <div class="bar-scroll">
    <div :style="{ height: chartHeight + 'px', position: 'relative' }">
      <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.bar-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}
</style>
