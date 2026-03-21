# HanasuAI Stats

Translation statistics dashboard for [HanasuAI](https://www.twitch.tv/hanasuai) — an AI-powered Twitch bot that translates chat messages in real time for multiple channels.

Built with **Nuxt 4** + **Chart.js**, served as a static SPA via **nginx** in Docker.

As I have no idea about webdev this project is vibecoded. lol. 
At least for now :D Maybe I'll learn a bit about nuxt using this. 

---

## Features

- � **HanasuAI Profile** — Twitch avatar, profile link, and bio at the top of the dashboard
- 📈 **Translation Trends** — line chart of translations over time (supports all languages dynamically)
- 📊 **Per-Channel Totals** — horizontal bar chart sorted by volume with scrolling for many channels
- 🍩 **Translation Split** — donut chart by channel or language
- 🧱 **Monthly Channel Composition** — stacked bar chart per month
- 🗣️ **Dynamic Languages** — auto-detects all translation languages from stats files (not hardcoded to JP/EN)
- 🎯 **Top N Channels** — quick dropdown to limit charts to top 10, 20, 50, or all channels
- 📅 **Date Presets** — quick buttons for Last 3 Months, Year-to-Date, or All Time ranges
- 📊 **Month-over-Month Deltas** — see translation change (+/-) and percentage vs. previous month
- 🔍 **Smart Filtering** — select channels, languages, date range, and view mode (monthly vs. cumulative)
- 🚫 **Auto-Hide Zero Channels** — only shows channels that have data for selected languages
- 🐳 **Docker-ready** — stats JSON files are volume-mounted; new monthly files are served instantly without rebuilding the image

---

## Stats File Format

Monthly stats are stored as JSON files in the `stats/` folder (one level above the project root when using Docker):

```
stats/
  2021-09-stats.json   # historical months
  2021-10-stats.json
  ...
  stats.json           # current month (always served as the latest)
```

Each file follows this schema:

```json
{
  "channellist": ["channel1", "channel2"],
  "perChannel": [
    { "channel": "channel1", "toJP": 1234, "toEN": 567, "toES": 89, "toFR": 45 }
  ],
  "Month":  { "toJP": 1801, "toEN": 890, "toES": 120, "toFR": 67 },
  "Total":  { "toJP": 99000, "toEN": 45000, "toES": 5400, "toFR": 2100 }
}
```

- **Language Keys** — any key starting with `to` + language code (e.g., `toJP`, `toEN`, `toES`, `toDE`, `toRU`, `toZH`, `toKO`) is auto-detected and displayed
- **`Month`** — translations for this calendar month only
- **`Total`** — cumulative totals since tracking began (used for the Cumulative view mode)

The dashboard automatically discovers all language codes from your stats files and displays them with native script names (e.g., "Japanese (日本語)", "Spanish (Español)", etc.)

---

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

For local development, copy or symlink your stats files into `public/stats/`:

```bash
# Windows (PowerShell)
Copy-Item ..\stats\* public\stats\
```

---

## Docker

### Build & run locally

```bash
docker compose up --build
# → http://localhost:8080
```

The `docker-compose.yml` mounts `../stats` read-only into the container at `/stats/`. Drop a new `YYYY-MM-stats.json` there and nginx serves it immediately — no rebuild needed.

### Build & push multi-arch image

```bat
build.bat
```

Builds for `linux/amd64` + `linux/arm64` and pushes to Docker Hub as `bielefeldj/hanasuai-stats:latest` and `bielefeldj/hanasuai-stats:<git-hash>`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (SPA mode, `ssr: false`) |
| Charts | [Chart.js](https://www.chartjs.org) via [vue-chartjs](https://vue-chartjs.org) |
| Styling | CSS custom properties, dark theme |--
| Server | [nginx:alpine](https://hub.docker.com/_/nginx) |
| Container | Docker + Docker Compose |

---

## About HanasuAI

> *"Hey! My name is HanasuAI. I am an expert in translating messages in chat. 🥰"*

HanasuAI is a Twitch bot that translates viewer messages between Japanese and multiple other languages in real time. This dashboard tracks translation statistics across any number of target languages. Follow on Twitch: [twitch.tv/hanasuai](https://www.twitch.tv/hanasuai)
