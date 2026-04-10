# CivicSense — AI Urban Intelligence Platform

> Real-time civic incident detection, classification, and routing powered by Claude AI.

![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node%20%2B%20Claude-00d4aa)

---

## What It Does

CivicSense lets citizens report urban problems (potholes, garbage overflow, broken streetlights, waterlogging) via photo or text. Claude AI instantly classifies the incident, assigns a severity score (1–10), and routes it to the correct municipal department (PWD, Sanitation, Electricity, Drainage).

A live map dashboard shows all incidents in real time with color-coded severity pins. An admin panel lets departments update status from Open → In Progress → Resolved.

---

## Features

- **AI Classification** — Claude analyzes photo + text, returns incident type, severity, department, action needed
- **Live Map** — Leaflet.js map with severity-colored markers, pulse animation on critical (severity ≥ 9)
- **Report Modal** — drag-drop image upload, optional text description, address
- **Stats Bar** — total, open, in-progress, resolved, critical count, avg severity
- **Incident Queue** — filterable by type (pothole/garbage/streetlight/waterlogging) and status
- **Admin Panel** — department-wise view, one-click status updates, dept breakdown cards
- **Persistent DB** — sql.js (pure-JS SQLite), persists to civicsense.db.json
- **Demo Data** — 12 pre-seeded incidents across Delhi for instant demo

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Leaflet.js |
| Backend | Node.js, Express |
| Database | sql.js (pure-JS SQLite — no native deps) |
| AI | Anthropic Claude claude-opus-4-5 |
| Fonts | Space Mono + DM Sans |

---

## Quick Start

### Prerequisites
- Node.js 18+
- An Anthropic API key → https://console.anthropic.com

### 1. Backend

```bash
cd backend
npm install --ignore-scripts
cp .env.example .env
# Open .env and set ANTHROPIC_API_KEY=your_key_here
node server.js
# → Running on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → Open http://localhost:5173
```

---

## Project Structure

```
civicsense/
├── backend/
│   ├── server.js          # Express API + Claude integration
│   ├── package.json
│   ├── .env.example       # Copy to .env and add API key
│   └── uploads/           # Uploaded images (auto-created)
└── frontend/
    ├── src/
    │   ├── App.jsx                    # Layout + sidebar nav
    │   ├── pages/
    │   │   ├── Dashboard.jsx          # Map + incident list
    │   │   └── AdminPanel.jsx         # Department management
    │   ├── components/
    │   │   ├── MapView.jsx            # Leaflet map + custom markers
    │   │   ├── StatsBar.jsx           # Top metrics bar
    │   │   ├── IncidentCard.jsx       # Sidebar incident row
    │   │   └── ReportModal.jsx        # Submit new incident
    │   └── utils/
    │       ├── api.js                 # Axios API helpers
    │       └── helpers.js             # Colors, labels, formatters
    ├── index.html
    └── vite.config.js                 # Proxies /api → localhost:3001
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List all (filterable: ?status=open&type=pothole) |
| GET | `/api/incidents/:id` | Single incident |
| POST | `/api/report` | Submit new (multipart: image?, text?, address?, latitude?, longitude?) |
| GET | `/api/stats` | Dashboard stats |
| PATCH | `/api/incidents/:id/status` | Update status `{status: "open"|"in-progress"|"resolved"}` |

---

## Demo: Live AI Classification

Upload any photo of a civic issue and the system returns:

```json
{
  "incident_type": "pothole",
  "severity": 8,
  "department": "PWD",
  "summary": "Large pothole blocking left lane near signal",
  "immediate_action": "Deploy repair crew, barricade lane within 6 hours",
  "estimated_resolution_hours": 12,
  "location_context": "Main road near traffic signal"
}
```

---

## Hackathon Pitch

> "Every Indian city has ₹100 crore worth of broken infrastructure and a 14-day response loop.  
> CivicSense cuts that to under 2 hours — AI triage, instant routing, real accountability."

**Demo moment:** Photograph something broken near the venue, upload live, watch Claude classify it in real time on the map.

---

## Made With

- [Anthropic Claude](https://anthropic.com) — AI classification engine
- [Leaflet.js](https://leafletjs.com) — Interactive maps
- [sql.js](https://sql.js.org) — Pure-JS SQLite
- [Vite](https://vitejs.dev) — Frontend build tool
