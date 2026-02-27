<script setup lang="ts">
import { Bar } from 'vue-chartjs'

function channelColor(channel: string, alpha = 1): string {
  let hash = 0
  for (let i = 0; i < channel.length; i++) {
    hash = channel.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const h = Math.abs(hash) % 360
  const s = 55 + (Math.abs(hash >> 8) % 25)
  const l = 42 + (Math.abs(hash >> 16) % 18)
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}

const { stackedMonthly, effectiveChannels } = useStatsData()
const filters = useFilters()

const chartKey = computed(() =>
  filters.value.selectedChannels.join() +
  filters.value.startMonth + filters.value.endMonth
)

const chartData = computed(() => {
  const rows     = stackedMonthly.value
  const channels = effectiveChannels.value
  const labels   = rows.map(r => r.label)

  const datasets = channels.map(ch => ({
    label: ch,
    data:  rows.map(r => r.channels[ch] ?? 0),
    backgroundColor: channelColor(ch, 0.8),
    borderColor:     channelColor(ch, 1),
    borderWidth: 0.5,
    stack: 'monthly',
  }))

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#c8c8e8',
        font: { size: 11 },
        padding: 10,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
      },
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
      grid: { color: 'rgba(100, 100, 200, 0.08)' },
      ticks: { color: '#7070a0', maxRotation: 45, autoSkip: true, maxTicksLimit: 18 },
    },
    y: {
      stacked: true,
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
  <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
</template>
