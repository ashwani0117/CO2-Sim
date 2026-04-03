# CO2-Sim
A simulation system for visualizing CO2 in a city digital twin
    A full-stack environmental digital twin that combines:
- a React + MapLibre simulation dashboard,
- a Node/Express API for simulator data and interventions,
- an optional FastAPI AI risk-analysis backend for alert generation.

It is designed for demo/hackathon workflows and can be extended to production.

## Modules

### 1) Core Simulator (Node + React)
- Interactive city layers and CO₂ heatmap visualization.
- Scenario playback from frame files in `client/public/data/sim_output`.
- In-app sensor management, intervention simulation, and statistics.

### 2) AI Alert Module (Python FastAPI)
- Risk scoring from sensor payloads.
- Threshold + anomaly + trend-based alerting.
- Returns reasons, confidence, severity, and recommended actions.

## Repository Structure

```text
client/                 React frontend (Vite)
server/                 Node/Express API and runtime entrypoints
shared/                 Shared TS schemas and types
python_backend/         FastAPI AI risk detection service
attached_assets/        Reference assets for project context
```

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind, shadcn/ui, MapLibre GL
- Backend (core): Node.js, Express, TypeScript, Zod, Drizzle schema tooling
- Backend (AI): Python, FastAPI, Pydantic, Uvicorn

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+ (for AI backend)

## Quick Start

Run all commands from the repository root (`urbantwin` folder).

### A) Start Core Simulator (required)

```bash
npm install
npm run dev
```

Open `http://localhost:5000`.

### B) Start AI Backend (optional, required for `/ai-alerts` live analysis)

```bash
cd ./python_backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies and run:

```bash
pip install -r requirements.txt
python main.py
```

FastAPI runs at `http://localhost:8000`.

## Environment Variables

Copy `.env.example` to `.env` (or export variables in shell):

- `PORT` (default `5000`) - Node server port
- `DATABASE_URL` (optional) - needed only for Drizzle DB push/migrations
- `VITE_API_URL` (optional, default `http://localhost:8000`) - AI backend base URL used by frontend risk client

## Available Routes

### Frontend
- `/` - Simulator dashboard
- `/ai-alerts` - AI alert dashboard

### Node API (`/api/*`)
- `GET /api/sensors`
- `POST /api/sensors`
- `PATCH /api/sensors/:id`
- `GET /api/simulations`
- `POST /api/simulations/run`
- `GET /api/stats`
- `GET /api/heatmap`
- `GET /api/layers/:layerType`
- `POST /api/predict`
- `POST /api/diffusion/calculate`

### FastAPI AI API
- `GET /health`
- `GET /info`
- `POST /analyze-risk`
- `POST /batch-analyze`

## Scripts

- `npm run dev` - run Express + Vite in development mode
- `npm run build` - build frontend and bundle server into `dist/`
- `npm run start` - run production bundle from `dist/index.js`
- `npm run check` - TypeScript check
- `npm run db:push` - Drizzle schema push (requires `DATABASE_URL`)

## Push-Ready Checklist

- Use `.gitignore` defaults in this repo (already excludes build, deps, env files, venvs).
- Do not commit secrets (`.env`, API keys, tokens).
- Ensure `npm run check` passes before pushing.
- If AI module is used, ensure `python_backend/requirements.txt` is up-to-date.

## Documentation

- AI module details: `AI_ALERT_SYSTEM_README.md`
- API test examples: `API_TESTING_GUIDE.md`
- Demo alert payloads: `TEST_ALERTS_EXAMPLES.py`
- Python backend setup: `python_backend/README.md`

## License

This repository is licensed under the MIT License. See `LICENSE`.
