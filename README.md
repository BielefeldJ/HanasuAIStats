# HanasuAI Stats

Translation statistics dashboard for [HanasuAI](https://www.twitch.tv/hanasuai) — an AI-powered Twitch bot that translates chat messages in real time for multiple channels.

Built with **Nuxt 4** + **Chart.js**, served as a static SPA via **nginx** in Docker.

As I have no idea about webdev this project is vibecoded. lol. 
At least for now :D Maybe I'll learn a bit about nuxt using this. 

---

## Features

- 📈 **Translation Trends** — line chart of JP/EN translations over time
- 📊 **Per-Channel Totals** — horizontal bar chart sorted by volume
- 🍩 **Translation Split** — donut chart by channel or language
- 🧱 **Monthly Channel Composition** — stacked bar chart per month
- 🔍 **Filters** — select channels, languages, date range, monthly vs. cumulative view
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
    { "channel": "channel1", "toJP": 1234, "toEN": 567 }
  ],
  "Month":  { "toJP": 1801, "toEN": 890 },
  "Total":  { "toJP": 99000, "toEN": 45000 }
}
```

- **`Month`** — translations for this calendar month only
- **`Total`** — cumulative totals since tracking began (used for the Cumulative view mode)

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
| Styling | CSS custom properties, dark theme |
| Server | [nginx:alpine](https://hub.docker.com/_/nginx) |
| Container | Docker + Docker Compose |
| Proxy | [Caddy](https://caddyserver.com) |

---

## About HanasuAI

> *"Hey! My name is HanasuAI. I am an expert in translating messages in chat. 🥰"*

HanasuAI is a Twitch bot that translates viewer messages between Japanese and English in real time. Follow on Twitch: [twitch.tv/hanasuai](https://www.twitch.tv/hanasuai)
