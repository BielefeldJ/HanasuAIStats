<script setup lang="ts">
const { loadData, isLoading, isLoaded, loadError, grandTotals, filteredMonths } = useStatsData()

onMounted(() => loadData())

function fmt(n: number): string {
  return n.toLocaleString()
}

onErrorCaptured((err) => {
  console.error('[HanasuStats] Component error:', err)
  return false // don't suppress
})
</script>

<template>
  <div class="dashboard">

    <!-- Header -->
    <header class="dash-header">
      <div class="header-inner">
        <div>
          <h1 class="dash-title">HanasuAI Stats</h1>
          <p class="dash-subtitle">Translation statistics across all channels</p>
        </div>
      </div>
    </header>

    <!-- Loading / Error -->
    <div v-if="isLoading" class="status-card">
      <div class="spinner"></div>
      <span>Loading statistics…</span>
    </div>

    <div v-else-if="loadError" class="status-card error">
      ⚠ {{ loadError }}
    </div>

    <template v-else-if="isLoaded">

      <!-- Filters -->
      <section class="section">
        <FilterPanel />
      </section>

      <!-- Summary row -->
      <section class="summary-row">
        <div class="stat-card">
          <div class="stat-value jp">{{ fmt(grandTotals.toJP) }}</div>
          <div class="stat-label">→ Japanese</div>
        </div>
        <div class="stat-card">
          <div class="stat-value en">{{ fmt(grandTotals.toEN) }}</div>
          <div class="stat-label">→ English</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ fmt(grandTotals.total) }}</div>
          <div class="stat-label">Total Translations</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ filteredMonths.length }}</div>
          <div class="stat-label">Months Shown</div>
        </div>
      </section>

      <!-- Line chart: translation trends over time -->
      <section class="section">
        <div class="chart-card">
          <h2 class="chart-title">Translation Trends Over Time</h2>
          <div class="chart-area tall">
            <ChartsLineChart />
          </div>
        </div>
      </section>

      <!-- Bar + Donut side by side -->
      <section class="section two-col">
        <div class="chart-card">
          <h2 class="chart-title">Translations per Channel</h2>
          <p class="chart-desc">Total in selected period, sorted by volume</p>
          <div class="chart-area" style="height: auto; min-height: 240px">
            <ChartsBarChart />
          </div>
        </div>

        <div class="chart-card">
          <h2 class="chart-title">Translation Split</h2>
          <p class="chart-desc">Share by channel or language in selected period</p>
          <div class="chart-area medium">
            <ChartsDonutChart />
          </div>
        </div>
      </section>

      <!-- Stacked bar: channel composition per month -->
      <section class="section">
        <div class="chart-card">
          <h2 class="chart-title">Monthly Channel Composition</h2>
          <p class="chart-desc">Combined JP + EN translations, stacked by channel</p>
          <div class="chart-area tall">
            <ChartsStackedBarChart />
          </div>
        </div>
      </section>

    </template>

  </div>
</template>

<style>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dash-header { padding: 4px 0 8px; }
.header-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.dash-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-bright);
  letter-spacing: -0.02em;
}
.dash-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.status-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--text-muted);
  font-size: 15px;
}
.status-card.error { color: #e06060; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  text-align: center;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  line-height: 1.2;
  letter-spacing: -0.03em;
}
.stat-value.jp { color: var(--accent-jp); }
.stat-value.en { color: var(--accent-en); }
.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}

.section { width: 100%; }
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 20px 16px;
}
.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-bright);
  margin-bottom: 2px;
}
.chart-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.chart-area {
  position: relative;
  width: 100%;
  height: 340px;
}
.chart-area.tall   { height: 420px; }
.chart-area.medium { height: 380px; }

@media (max-width: 900px) {
  .summary-row { grid-template-columns: 1fr 1fr; }
  .two-col     { grid-template-columns: 1fr; }
}
@media (max-width: 540px) {
  .stat-value { font-size: 22px; }
}
</style>
