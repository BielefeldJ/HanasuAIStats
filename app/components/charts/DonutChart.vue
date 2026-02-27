<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'

const JP_COLOR = 'hsla(205, 75%, 58%, 1)'
const EN_COLOR = 'hsla(25, 80%, 60%, 1)'

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

const { perChannelTotals, grandTotals } = useStatsData()
const filters = useFilters()

type DonutMode = 'channels' | 'languages'
const donutMode = ref<DonutMode>('channels')

const chartKey = computed(() =>
  filters.value.selectedChannels.join() +
  filters.value.selectedLanguages.join() +
  filters.value.startMonth + filters.value.endMonth +
  donutMode.value
)

const chartData = computed(() => {
  if (donutMode.value === 'languages') {
    const labels: string[] = []
    const data: number[]   = []
    const colors: string[] = []

    if (filters.value.selectedLanguages.includes('toJP')) {
      labels.push('→ Japanese')
      data.push(grandTotals.value.toJP)
      colors.push(JP_COLOR)
    }
    if (filters.value.selectedLanguages.includes('toEN')) {
      labels.push('→ English')
      data.push(grandTotals.value.toEN)
      colors.push(EN_COLOR)
    }
    return { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#12122a', borderWidth: 2 }] }
  }

  // Per-channel mode
  const entries = perChannelTotals.value
  return {
    labels:   entries.map(e => e.channel),
    datasets: [{
      data:            entries.map(e => e.total),
      backgroundColor: entries.map(e => channelColor(e.channel, 0.85)),
      borderColor:     '#12122a',
      borderWidth:     2,
    }],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#c8c8e8',
        font: { size: 11 },
        padding: 10,
        boxWidth: 12,
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
        label: (ctx: any) => {
          const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0)
          const pct   = total ? ((ctx.raw / total) * 100).toFixed(1) : '0.0'
          return ` ${Number(ctx.raw).toLocaleString()} (${pct}%)`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="donut-wrap">
    <div class="donut-mode-toggle">
      <button :class="['mode-btn', { active: donutMode === 'channels' }]" @click="donutMode = 'channels'">
        By Channel
      </button>
      <button :class="['mode-btn', { active: donutMode === 'languages' }]" @click="donutMode = 'languages'">
        JP vs EN
      </button>
    </div>
    <div class="donut-chart">
      <Doughnut :key="chartKey" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.donut-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
}

.donut-mode-toggle {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.mode-btn {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-muted);
  transition: all 0.15s;
  cursor: pointer;
}
.mode-btn:hover { border-color: var(--border-focus); color: var(--text); }
.mode-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.donut-chart {
  flex: 1;
  min-height: 0;
}
</style>
