# NeuroControl AI

NeuroControl AI is a next-generation industrial control system interface for the hackathon theme. It replaces a static HMI screen with a role-aware, database-backed dashboard that shows live telemetry, alarm priority, maintenance work, notifications, and an AI copilot.

## Live Project

- Frontend: https://neurocontrol-ai.vercel.app
- Backend health: https://neurocontrol-ai.onrender.com/health
- Backend API base: https://neurocontrol-ai.onrender.com

## What Works

- Role login for operator, supervisor, and engineer views.
- Active dashboard pages: overview, alarm triage, AI copilot, assets, and notifications.
- Live backend API with Server-Sent Events for real-time updates.
- Database-backed state using Supabase Postgres in production or SQLite locally.
- Active controls for alarm acknowledgement, work order status, notification read state, and control mode changes.
- AI answers through local safety logic by default, with optional Gemini/OpenAI API integration.
- Real sensor/demo ingestion through `POST /api/ingest/telemetry`.

## Clean Project Structure

```text
windsurf-project/
  backend/                 Node/Express API for Render
    server.js
    package.json
    render.yaml
  public/                  React public assets
  src/                     React dashboard
    components/
    services/
    App.js
    App.css
    index.js
  DEMO_GUIDE.md            Step-by-step presentation flow
  DEPLOYMENT_GUIDE.md      Vercel, Render, Supabase setup
  REAL_WORLD_DATA_GUIDE.md Real device and sensor integration
  package.json             Frontend scripts
  vercel.json              Vercel frontend config
```

Old duplicate prototypes, standalone HTML files, installers, and unused Supabase edge-function drafts have been removed so this is now a single clean repo.

## Run Locally

Terminal 1, backend:

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project\backend
npm.cmd install
npm.cmd start
```

Terminal 2, frontend:

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project
npm.cmd install
npm.cmd run build
npx.cmd --yes serve -s build -l 4173
```

Open `http://127.0.0.1:4173`.

## Main Guides

- Deployment: `DEPLOYMENT_GUIDE.md`
- Demo script: `DEMO_GUIDE.md`
- Real-world data: `REAL_WORLD_DATA_GUIDE.md`
