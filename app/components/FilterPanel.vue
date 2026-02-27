<script setup lang="ts">
import { getAllMonths } from '~/utils/months'

function channelColor(channel: string, alpha = 1): string {
  let hash = 0
  for (let i = 0; i < channel.length; i++) {
    hash = channel.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsla(${hue}, 65%, 58%, ${alpha})`
}

const filters    = useFilters()
const { allChannels } = useStatsData()

const monthOptions = getAllMonths().map(m => ({ value: m.yearMonth, label: m.label }))

const isAllSelected = computed(() =>
  filters.value.selectedChannels.length === allChannels.value.length
)

function isChannelSelected(ch: string): boolean {
  return filters.value.selectedChannels.includes(ch)
}

function toggleChannel(ch: string) {
  const idx = filters.value.selectedChannels.indexOf(ch)
  if (idx >= 0) {
    filters.value.selectedChannels.splice(idx, 1)
  } else {
    filters.value.selectedChannels.push(ch)
  }
}

function toggleAll() {
  if (isAllSelected.value) {
    filters.value.selectedChannels = []
  } else {
    filters.value.selectedChannels = allChannels.value.slice()
  }
}

function toggleLanguage(lang: 'toJP' | 'toEN') {
  const idx = filters.value.selectedLanguages.indexOf(lang)
  if (idx >= 0) {
    if (filters.value.selectedLanguages.length > 1) {
      filters.value.selectedLanguages.splice(idx, 1)
    }
    // Don't allow deselecting the last language
  } else {
    filters.value.selectedLanguages.push(lang)
  }
}

const isOpen = ref(true)
</script>

<template>
  <div class="filter-panel">
    <div class="filter-header" @click="isOpen = !isOpen">
      <span class="filter-title">⚙ Filters</span>
      <span class="filter-toggle">{{ isOpen ? '▲' : '▼' }}</span>
    </div>

    <div v-if="isOpen" class="filter-body">
      <!-- Channels -->
      <div class="filter-section">
        <div class="section-label">
          Channels
          <button class="chip-btn" :class="{ active: isAllSelected }" @click="toggleAll">
            {{ isAllSelected ? 'None' : 'All' }}
          </button>
        </div>
        <div class="channel-list">
          <label
            v-for="ch in allChannels"
            :key="ch"
            class="channel-item"
          >
            <input
              type="checkbox"
              :checked="isChannelSelected(ch)"
              @change="toggleChannel(ch)"
            />
            <span class="channel-dot" :style="{ background: channelColor(ch) }"></span>
            <span class="channel-name">{{ ch }}</span>
          </label>
        </div>
      </div>

      <!-- Languages -->
      <div class="filter-section">
        <div class="section-label">Language</div>
        <div class="toggle-group">
          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="filters.selectedLanguages.includes('toJP')"
              @change="toggleLanguage('toJP')"
            />
            <span class="lang-badge jp">→ JP</span>
          </label>
          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="filters.selectedLanguages.includes('toEN')"
              @change="toggleLanguage('toEN')"
            />
            <span class="lang-badge en">→ EN</span>
          </label>
        </div>
      </div>

      <!-- View Mode -->
      <div class="filter-section">
        <div class="section-label">View</div>
        <div class="toggle-group">
          <label class="toggle-item">
            <input
              type="radio"
              name="viewMode"
              value="monthly"
              v-model="filters.viewMode"
            />
            <span>Monthly</span>
          </label>
          <label class="toggle-item">
            <input
              type="radio"
              name="viewMode"
              value="cumulative"
              v-model="filters.viewMode"
            />
            <span>Cumulative</span>
          </label>
        </div>
      </div>

      <!-- Date Range -->
      <div class="filter-section">
        <div class="section-label">Date Range</div>
        <div class="date-range">
          <select v-model="filters.startMonth">
            <option
              v-for="m in monthOptions"
              :key="m.value"
              :value="m.value"
              :disabled="m.value > filters.endMonth"
            >{{ m.label }}</option>
          </select>
          <span class="range-separator">→</span>
          <select v-model="filters.endMonth">
            <option
              v-for="m in monthOptions"
              :key="m.value"
              :value="m.value"
              :disabled="m.value < filters.startMonth"
            >{{ m.label }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.filter-header:hover { background: var(--bg-card-hover); }

.filter-title { font-weight: 600; color: var(--text-bright); font-size: 13px; }
.filter-toggle { color: var(--text-muted); font-size: 11px; }

.filter-body {
  display: grid;
  grid-template-columns: 1fr 120px 160px 1fr;
  gap: 0;
}

.filter-section {
  padding: 14px 16px;
  border-right: 1px solid var(--border);
}
.filter-section:last-child { border-right: none; }

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip-btn {
  font-size: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1px 8px;
  color: var(--text-muted);
  transition: all 0.15s;
  cursor: pointer;
}
.chip-btn:hover { border-color: var(--border-focus); color: var(--text); }
.chip-btn.active { border-color: var(--accent-jp); color: var(--accent-jp); }

.channel-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.1s;
}
.channel-item:hover { background: var(--bg-input); }

.channel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.channel-name { font-size: 12px; color: var(--text); }

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
}

.lang-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 4px;
}
.lang-badge.jp { background: hsla(205, 75%, 58%, 0.2); color: var(--accent-jp); }
.lang-badge.en { background: hsla(25, 80%, 60%, 0.2);  color: var(--accent-en); }

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.range-separator { color: var(--text-muted); font-size: 12px; }

@media (max-width: 900px) {
  .filter-body {
    grid-template-columns: 1fr 1fr;
  }
  .filter-section:nth-child(2) { border-right: none; }
  .filter-section:nth-child(3) { border-top: 1px solid var(--border); }
}

@media (max-width: 600px) {
  .filter-body {
    grid-template-columns: 1fr;
  }
  .filter-section { border-right: none; border-top: 1px solid var(--border); }
  .filter-section:first-child { border-top: none; }
}
</style>
