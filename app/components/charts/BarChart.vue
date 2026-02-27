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

const { perChannelTotals } = useStatsData()
const filters = useFilters()

const chartKey = computed(() =>
  filters.value.selectedChannels.join() +
  filters.value.selectedLanguages.join() +
  filters.value.startMonth + filters.value.endMonth
)

const chartData = computed(() => {
  const entries = perChannelTotals.value
  const labels = entries.map(e => e.channel)
  const datasets: any[] = []

  if (filters.value.selectedLanguages.includes('toJP')) {
    datasets.push({
      label: '→ Japanese',
      data: entries.map(e => e.toJP),
      backgroundColor: entries.map(e => channelColor(e.channel, 0.75)),
      borderColor:     entries.map(e => channelColor(e.channel, 1)),
      borderWidth: 1,
      stack: 'total',
    })
  }

  if (filters.value.selectedLanguages.includes('toEN')) {
    datasets.push({
      label: '→ English',
      data: entries.map(e => e.toEN),
      backgroundColor: entries.map(e => channelColor(e.channel, 0.4)),
      borderColor:     entries.map(e => channelColor(e.channel, 0.7)),
      borderWidth: 1,
      borderDash: [4, 2],
      stack: 'total',
    })
  }

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
  <div :style="{ height: chartHeight + 'px', position: 'relative' }">
    <Bar :key="chartKey" :data="chartData" :options="chartOptions" />
  </div>
</template>
