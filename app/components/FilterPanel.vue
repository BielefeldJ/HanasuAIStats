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

const filters = useFilters()
const { allChannels, languageMeta, channelsWithData, topNChannelsByAll } = useStatsData()

const monthOptions = getAllMonths().map(m => ({ value: m.yearMonth, label: m.label }))

// When top N changes, auto-select only the top N channels
watchEffect(() => {
  // Access topNChannels to create dependency
  const _ = filters.value.topNChannels
  // Now update selected channels to match the top N across all channels
  const topChannels = topNChannelsByAll.value.map((item: { channel: string; byLanguage: any; total: number }) => item.channel)
  filters.value.selectedChannels = topChannels
})

const visibleChannels = computed(() =>
  allChannels.value.filter((ch: string) => channelsWithData.value.has(ch))
)

const topNOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: 'All', value: 0 },
]

function applyDatePreset(preset: 'last3' | 'ytd' | 'all') {
  if (monthOptions.length === 0) return

  const latestOption = monthOptions[monthOptions.length - 1]
  const earliestOption = monthOptions[0]
  if (!latestOption || !earliestOption) return

  const latest = latestOption.value
  const earliest = earliestOption.value

  if (preset === 'all') {
    filters.value.startMonth = earliest
    filters.value.endMonth = latest
    return
  }

  if (preset === 'last3') {
    const startIndex = Math.max(0, monthOptions.length - 3)
    const startOption = monthOptions[startIndex]
    if (!startOption) return
    filters.value.startMonth = startOption.value
    filters.value.endMonth = latest
    return
  }

  const year = latest.slice(0, 4)
  const firstInYear = monthOptions.find(m => m.value.startsWith(`${year}-`))?.value ?? earliest
  filters.value.startMonth = firstInYear
  filters.value.endMonth = latest
}

function isPresetActive(preset: 'last3' | 'ytd' | 'all'): boolean {
  if (monthOptions.length === 0) return false

  const latestOption = monthOptions[monthOptions.length - 1]
  const earliestOption = monthOptions[0]
  if (!latestOption || !earliestOption) return false

  const latest = latestOption.value
  const earliest = earliestOption.value

  if (preset === 'all') {
    return filters.value.startMonth === earliest && filters.value.endMonth === latest
  }

  if (preset === 'last3') {
    const startIndex = Math.max(0, monthOptions.length - 3)
    const startOption = monthOptions[startIndex]
    if (!startOption) return false
    return filters.value.startMonth === startOption.value && filters.value.endMonth === latest
  }

  const year = latest.slice(0, 4)
  const firstInYear = monthOptions.find(m => m.value.startsWith(`${year}-`))?.value ?? earliest
  return filters.value.startMonth === firstInYear && filters.value.endMonth === latest
}

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

function toggleLanguage(lang: string) {
  const idx = filters.value.selectedLanguages.indexOf(lang)
  if (idx >= 0) {
    if (filters.value.selectedLanguages.length > 1) {
      filters.value.selectedLanguages.splice(idx, 1)
    }
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
      <div class="filter-section">
        <div class="section-label">
          Channels
          <button class="chip-btn" :class="{ active: isAllSelected }" @click="toggleAll">
            {{ isAllSelected ? 'None' : 'All' }}
          </button>
        </div>
        <div class="channel-list">
          <label
            v-for="ch in visibleChannels"
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

        <div class="topn-row">
          <span class="topn-label">Top channels</span>
          <select v-model.number="filters.topNChannels" class="topn-select">
            <option
              v-for="opt in topNOptions"
              :key="opt.label"
              :value="opt.value"
            >{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <div class="filter-section">
        <div class="section-label">Language</div>
        <div class="toggle-group">
          <label
            v-for="lang in languageMeta"
            :key="lang.key"
            class="toggle-item"
          >
            <input
              type="checkbox"
              :checked="filters.selectedLanguages.includes(lang.key)"
              @change="toggleLanguage(lang.key)"
            />
            <span
              class="lang-badge"
              :style="{ background: languageColor(lang.key, 0.2), color: languageColor(lang.key, 1) }"
            >→ {{ lang.label }}</span>
          </label>
        </div>
      </div>

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

      <div class="filter-section">
        <div class="section-label">Date Range</div>
        <div class="preset-row">
          <button class="chip-btn" :class="{ active: isPresetActive('last3') }" @click="applyDatePreset('last3')">Last 3M</button>
          <button class="chip-btn" :class="{ active: isPresetActive('ytd') }" @click="applyDatePreset('ytd')">YTD</button>
          <button class="chip-btn" :class="{ active: isPresetActive('all') }" @click="applyDatePreset('all')">All Time</button>
        </div>
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
  grid-template-columns: 1fr 160px 160px 1fr;
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

.topn-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

.topn-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.topn-select {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text);
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

.preset-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

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
