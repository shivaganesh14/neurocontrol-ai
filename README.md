# NeuroControl AI

NeuroControl AI is a production-ready industrial HMI dashboard built with React. The frontend focuses on a control-room workflow: live plant telemetry, role-aware alarm triage, process state, and maintenance priorities.

## Quick Start

```bash
npm install
npm run build
npm start
```

The local development site runs at `http://localhost:3000`.

## Production Preview

```bash
npm run build
npm run preview -- --listen 4173
```

## Deployment

The root frontend is configured for Vercel with `vercel.json`.

```bash
npx vercel --prod
```

Vercel should use:

- Build command: `npm run build`
- Output directory: `build`
- Framework preset: Create React App

## Structure

```text
windsurf-project/
  public/
    index.html
  src/
    components/
      DashboardShell.js
    data/
      dashboardData.js
    App.css
    App.js
    index.js
  package.json
  vercel.json
```

Backend and earlier prototype files are kept out of the frontend deployment by `.vercelignore`.
