# NeuroControl AI Deployment Guide

This guide deploys the current React dashboard in the project root to Vercel.

## Project Location

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project
```

## What Gets Deployed

The production frontend uses:

```text
src/
  App.js
  App.css
  components/DashboardShell.js
  data/dashboardData.js
public/index.html
package.json
vercel.json
```

The backend folders, prototype HTML files, installer, and old docs are excluded from the Vercel upload by `.vercelignore`.

## Local Build Check

Run this before deploying:

```powershell
npm.cmd install
npm.cmd run build
```

Expected result:

```text
Compiled successfully.
The build folder is ready to be deployed.
```

## Local Production Preview

To preview the exact production build locally:

```powershell
npx.cmd --yes serve -s build -l 4173
```

Open:

```text
http://127.0.0.1:4173
```

## Deploy To Vercel

First refresh the Vercel login if needed:

```powershell
npx.cmd vercel logout
npx.cmd vercel login
```

Then deploy:

```powershell
npx.cmd vercel --prod --yes
```

If Vercel asks for project settings in the browser or CLI, use these values. Do not type these labels as terminal commands.

| Setting | Value |
| --- | --- |
| Framework Preset | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |

These are already configured in `vercel.json`.

## If Vercel Says The Token Is Invalid

The previous deploy attempt reached Vercel, but the saved token on this machine was rejected:

```text
The specified token is not valid.
```

Fix it with:

```powershell
npx.cmd vercel logout
npx.cmd vercel login
npx.cmd vercel --prod --yes
```

If login opens a browser, finish the authentication in the browser and then rerun the deploy command.

## Live Backend And Database

The dashboard now supports a live API. Locally, the backend uses a real SQLite database file at `backend/data/neurocontrol-demo.db`. In production, set `DATABASE_URL` to a Postgres database connection string from Supabase, Render Postgres, Neon, or another hosted Postgres provider.

### Run Backend Locally

Open a second terminal:

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project\backend
npm.cmd install
npm.cmd start
```

Check it:

```text
http://127.0.0.1:5000/health
http://127.0.0.1:5000/api/dashboard
```

Reset the demo data before presenting:

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:5000/api/demo/reset -Method POST -UseBasicParsing
```

Keep this terminal open while showing the local demo.

### Deploy Backend To Render

Create a Render Web Service with:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check: /health
```

Add these environment variables in Render:

```text
NODE_ENV=production
NODE_VERSION=24.15.0
DATABASE_URL=your_postgres_connection_string
FRONTEND_ORIGIN=https://neurocontrol-ai.vercel.app
GEMINI_API_KEY=optional_google_ai_studio_key
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` is optional. Without it, the backend still returns local AI recommendations for the demo. With it, `/api/ai/assistant` calls Gemini. Use Google AI Studio to create a key.

If you use Supabase Postgres, paste the pooled connection string into `DATABASE_URL`. If you use Render Postgres, copy the internal database URL into `DATABASE_URL`.

After Render deploys, copy its URL, for example:

```text
https://neurocontrol-ai-backend.onrender.com
```

### Connect Vercel Frontend To Backend

In Vercel project settings, add:

```text
REACT_APP_API_URL=https://neurocontrol-ai.onrender.com
```

Redeploy the frontend:

```powershell
npx.cmd vercel --prod --yes
```

The dashboard header should change from `Demo Fallback` to `Backend Connected`, and the database pill should show the backend database driver.

### Real-Time And AI Endpoints

After deploying, these backend endpoints should work:

```text
GET  /health
POST /api/auth/login
GET  /api/dashboard
GET  /api/database
GET  /api/stream
POST /api/ai/assistant
POST /api/control/mode
POST /api/alarms/:id/acknowledge
POST /api/demo/reset
```

`/api/stream` sends live telemetry events and stores each new telemetry point in the database.

## Final Checklist

- `npm.cmd run build` passes.
- `http://127.0.0.1:4173` shows the dashboard.
- Vercel login is valid.
- `npx.cmd vercel --prod --yes` returns a production URL.
- Open the production URL and verify role tabs, alarm expansion, and acknowledge actions.
