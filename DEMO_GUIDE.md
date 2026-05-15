# NeuroControl AI Demo Guide

Use this flow to show the project as a live industrial HMI with a backend and connected database.

## 1. Start The Live Local Demo

Terminal 1: backend API with SQLite database

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project\backend
npm.cmd install
npm.cmd start
```

Leave it running. It serves:

```text
http://127.0.0.1:5000/health
http://127.0.0.1:5000/api/dashboard
http://127.0.0.1:5000/api/stream
```

Optional reset before presenting:

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:5000/api/demo/reset -Method POST -UseBasicParsing
```

Terminal 2: frontend production preview

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project
npm.cmd install
npm.cmd run build
npx.cmd --yes serve -s build -l 4173
```

Open:

```text
http://127.0.0.1:4173
```

## 2. Prove The Database Is Connected

Open this URL in another browser tab:

```text
http://127.0.0.1:5000/health
```

Point out:

```text
database.status = connected
database.driver = sqlite
alarmCount = 4
```

That confirms the backend is live and reading seeded alarm data from `backend/data/neurocontrol-demo.db`.

## 3. Login And Role Personalization

Start on the login screen:

1. Select `Operator` to show a simplified critical-alarm workspace.
2. Refresh or clear session storage, then select `Engineer` to show full diagnostics and the database page.

For the final pitch, use `Engineer` because it unlocks all demo pages.

## 4. Demo Talk Track

Start with:

```text
This is NeuroControl AI, an industrial control-room dashboard. It is not just a static UI: the React frontend is connected to a backend API, and the backend is reading and updating data from a database.
```

Then show the header:

```text
The top status shows Backend Connected. That means the dashboard is using the API instead of fallback data.
```

Then show role-based filtering:

1. Login as `Operator`.
2. Explain that operators get a reduced view focused on action.
3. Login as `Engineer`.
4. Explain that engineers get full diagnostics, assets, and database proof.

Then show alarm triage:

1. Expand `Pump Station A pressure anomaly`.
2. Read the recommended action.
3. Explain that this is where AI-assisted maintenance guidance appears.
4. Click `Acknowledge`.
5. Point out that the alarm count changes.

Then show backend proof:

```text
When I acknowledge an alarm, the frontend calls POST /api/alarms/:id/acknowledge and the backend updates the database. Refreshing the dashboard keeps the acknowledged state because it is database-backed.
```

Then show real-time data:

```text
The chart is fed by GET /api/stream. Every live telemetry event creates a fresh database row, so this is not just animation on the browser.
```

Then show AI:

1. Click `AI Copilot`.
2. Ask: `What should the operator prioritize next?`
3. Click `Ask AI`.
4. Explain that the backend uses local AI rules by default and can call Gemini when `GEMINI_API_KEY` is configured.

Then show database:

1. Click `Database`.
2. Show telemetry row count increasing after live stream events.
3. Show `Recent Actions` after login, control changes, AI questions, or alarm acknowledgement.

## 5. Production Demo With Render And Vercel

Use this after deploying the backend to Render and frontend to Vercel.

Backend health URL:

```text
https://neurocontrol-ai.onrender.com/health
```

Frontend URL:

```text
https://neurocontrol-ai.vercel.app
```

In the live demo, show:

- Render backend `/health` returns `database.status = connected`.
- Vercel dashboard header shows `Backend Connected`.
- Role tabs filter alarms.
- Acknowledge updates the alarm count.
- `AI Copilot` returns a recommendation.
- `Database` shows stored live telemetry and operator actions.
- Refresh does not lose database-backed alarm state.

## 6. Quick Recovery

If the frontend says `Demo Fallback`, the backend URL is not reachable.

Check:

```text
REACT_APP_API_URL
FRONTEND_ORIGIN
DATABASE_URL
```

Then redeploy the frontend after changing `REACT_APP_API_URL`.
