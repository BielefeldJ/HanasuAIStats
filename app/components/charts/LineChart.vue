<script setup lang="ts">
import { Line } from 'vue-chartjs'

const JP_COLOR    = 'hsla(205, 75%, 58%, 1)'
const JP_COLOR_BG = 'hsla(205, 75%, 58%, 0.18)'
const EN_COLOR    = 'hsla(25, 80%, 60%, 1)'
const EN_COLOR_BG = 'hsla(25, 80%, 60%, 0.18)'

const { aggregatedTimeSeries } = useStatsData()
const filters = useFilters()

const chartKey = computed(() =>
  filters.value.selectedChannels.join() +
  filters.value.selectedLanguages.join() +
  filters.value.startMonth + filters.value.endMonth +
  filters.value.viewMode
)

const chartData = computed(() => {
  const series = aggregatedTimeSeries.value
  const labels = series.map(s => s.label)
  const datasets: any[] = []

  if (filters.value.selectedLanguages.includes('toJP')) {
    datasets.push({
      label: '→ Japanese',
      data: series.map(s => s.toJP),
      borderColor: JP_COLOR,
      backgroundColor: JP_COLOR_BG,
      fill: true,
      tension: 0.35,
      pointRadius: series.length > 30 ? 0 : 3,
      pointHoverRadius: 6,
    })
  }

  if (filters.value.selectedLanguages.includes('toEN')) {
    datasets.push({
      label: '→ English',
      data: series.map(s => s.toEN),
      borderColor: EN_COLOR,
      backgroundColor: EN_COLOR_BG,
      fill: true,
      tension: 0.35,
      pointRadius: series.length > 30 ? 0 : 3,
      pointHoverRadius: 6,
    })
  }

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
