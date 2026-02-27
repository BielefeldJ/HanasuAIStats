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

    <!-- Header / Profile banner -->
    <header class="dash-header">
      <div class="profile-banner">
        <a href="https://www.twitch.tv/hanasuai" target="_blank" rel="noopener" class="profile-avatar-link">
          <img
            src="https://static-cdn.jtvnw.net/jtv_user_pictures/cd8f9e9e-78ea-448f-9bba-a87b67b8e323-profile_image-300x300.png"
            alt="HanasuAI avatar"
            class="profile-avatar"
          />
        </a>
        <div class="profile-info">
          <div class="profile-name-row">
            <h1 class="dash-title">HanasuAI Stats</h1>
            <a href="https://www.twitch.tv/hanasuai" target="_blank" rel="noopener" class="twitch-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
              Watch on Twitch
            </a>
          </div>
          <p class="profile-about">Hey! My name is HanasuAI. I am an expert in translating messages in chat. 🥰<br /><span class="profile-about-jp">私の名前はHanasuAIです。私は、チャットのメッセージを翻訳する専門家です。🥰</span></p>
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

.profile-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
}

.profile-avatar-link { flex-shrink: 0; }
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #9147ff;
  display: block;
  transition: transform 0.2s;
}
.profile-avatar:hover { transform: scale(1.05); }

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.twitch-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #9147ff;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
}
.twitch-badge:hover { background: #772ce8; }

.profile-about {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
  margin: 0;
}
.profile-about-jp {
  font-size: 12px;
  color: var(--text-muted);
}

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
@media (max-width: 600px) {
  .profile-banner { flex-direction: column; align-items: flex-start; gap: 14px; }
  .profile-avatar { width: 64px; height: 64px; }
}
@media (max-width: 540px) {
  .stat-value { font-size: 22px; }
}
</style>
