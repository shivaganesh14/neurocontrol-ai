# NeuroControl AI Deployment Guide

This is the clean single-repo deployment path for:

- Frontend on Vercel: `https://neurocontrol-ai.vercel.app`
- Backend on Render: `https://neurocontrol-ai.onrender.com`
- Database on Supabase Postgres
- Optional AI with Gemini or OpenAI

Do not type setting labels like `Build Command:` or `Output Directory:` into the terminal. Those values go inside the Vercel or Render dashboard fields.

## 1. Push The Clean Repo

PowerShell:

```powershell
cd C:\Users\ADMIN\Documents\ABBHMI\CascadeProjects\windsurf-project
git status --short
git add -A
git commit -m "Clean repo and finalize live dashboard guides"
git push origin main
```

Git Bash:

```bash
cd /c/Users/ADMIN/Documents/ABBHMI/CascadeProjects/windsurf-project
git status --short
git add -A
git commit -m "Clean repo and finalize live dashboard guides"
git push origin main
```

If Git says there is nothing to commit, continue to redeploy Render and Vercel.

## 2. Supabase Database

Create or open your Supabase project, then copy a Postgres connection string.

Use the pooled connection string if Supabase shows one. It usually looks like this:

```text
postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

Paste that value into Render as `DATABASE_URL`.

You do not need to manually create tables. The backend creates the demo tables automatically on startup.

## 3. Render Backend

Create or edit one Render Web Service from the same GitHub repo.

Use these settings:

```text
Name: neurocontrol-ai
Repository: shivaganesh14/neurocontrol-ai
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /health
Plan: Free
```

Add these Render environment variables:

```text
NODE_ENV=production
NODE_VERSION=24.15.0
FRONTEND_ORIGIN=https://neurocontrol-ai.vercel.app
DATABASE_URL=PASTE_YOUR_SUPABASE_POSTGRES_URL_HERE
DB_SSL=true
GEMINI_MODEL=gemini-2.5-flash
```

Optional AI variables:

```text
GEMINI_API_KEY=PASTE_REAL_GEMINI_KEY_HERE
OPENAI_API_KEY=PASTE_REAL_OPENAI_KEY_HERE
AI_MODEL=gpt-5.4-mini
```

Only add `GEMINI_API_KEY` or `OPENAI_API_KEY` if you have a real key. A fake placeholder key will make the backend try that provider and then fall back. For a free AI option, use a Gemini API key from Google AI Studio. If no AI key is added, the backend still gives local industrial safety recommendations.

After Render deploys, test:

```text
https://neurocontrol-ai.onrender.com/health
```

Expected result:

```text
status = ok
database.status = connected
```

If your backend URL opens the same React page as Vercel, Render is using the wrong service/root. The Render service must use `Root Directory: backend` and `Start Command: npm start`.

## 4. Vercel Frontend

Create or edit the Vercel project from the same GitHub repo.

Use these settings:

```text
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
Install Command: npm install
Root Directory: leave empty
```

Add this Vercel environment variable:

```text
REACT_APP_API_URL=https://neurocontrol-ai.onrender.com
```

Redeploy the Vercel project after adding the env variable.

Open:

```text
https://neurocontrol-ai.vercel.app
```

Expected result:

```text
Backend Connected
Real-time stream active
Role pages and buttons working
```

## 5. Production Checks

Open these URLs:

```text
https://neurocontrol-ai.onrender.com/health
https://neurocontrol-ai.onrender.com/api/dashboard
https://neurocontrol-ai.vercel.app
```

Then test these UI actions:

- Login as `Engineer`.
- Open `Alarm Triage`.
- Acknowledge one alarm.
- Click the floating `AI Copilot` button and ask `what is the energy load`.
- Click the header bell and mark one AI-filtered notification as read.
- Open `Assets` and move a work order to `In progress` or `Complete`.
- Refresh the page and confirm the changes are still there.

## 6. Reset Demo Data

Use this before a presentation if you want the seeded demo state back:

```powershell
Invoke-WebRequest -Uri https://neurocontrol-ai.onrender.com/api/demo/reset -Method POST -UseBasicParsing
```

## 7. Hike Values For A Critical Demo Moment

Use this to manually raise pressure, energy load, and risk:

```powershell
Invoke-WebRequest `
  -Uri https://neurocontrol-ai.onrender.com/api/demo/hike `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"pressure":106,"temperature":83,"flow":72,"energyLoad":91,"riskIndex":48}' `
  -UseBasicParsing
```

Expected result:

```text
Energy Load = 91%
Risk Index = 48
Pump Station A = critical top alarm
AI-filtered critical notification appears
```

## 8. Common Fixes

Frontend says `Demo Fallback`:

```text
Check Vercel env: REACT_APP_API_URL=https://neurocontrol-ai.onrender.com
Redeploy Vercel after editing the env variable.
```

Backend health fails:

```text
Check Render root directory is backend.
Check Render start command is npm start.
Check DATABASE_URL is valid.
```

AI answer is local only:

```text
Add GEMINI_API_KEY in Render, then redeploy Render.
Local AI still works without a paid API key.
```

Database is not Supabase:

```text
Render is missing DATABASE_URL or the URL is invalid.
Add the Supabase Postgres URL, keep DB_SSL=true, then redeploy.
```
