# NeuroControl AI Demo Guide

Use this flow to show that the project is not a static template. It has a live frontend, backend API, database, real-time updates, separate role dashboards, AI-filtered notifications, active alarm/work-order actions, and a floating AI copilot.

## 1. Pre-Demo Reset

Open this first:

```text
https://neurocontrol-ai.onrender.com/health
```

Confirm:

```text
status = ok
database.status = connected
```

Optional reset:

```powershell
Invoke-WebRequest -Uri https://neurocontrol-ai.onrender.com/api/demo/reset -Method POST -UseBasicParsing
```

Then open:

```text
https://neurocontrol-ai.vercel.app
```

## 2. Main Story

Say this:

```text
NeuroControl AI is a modern industrial control-room interface. Instead of showing hundreds of equal alerts, it prioritizes critical alarms, personalizes the dashboard by operator role, stores actions in a database, and gives AI-assisted operating guidance.
```

## 3. Role-Based Dashboard

1. Login as `Operator`.
2. Show that the operator view focuses on immediate overview and alarm triage.
3. Logout or refresh, then login as `Engineer`.
4. Show that engineer access includes assets, process diagnostics, and maintenance work orders.

Say this:

```text
Each role gets a different dashboard. Operators get fast action; supervisors get shift exceptions and output progress; engineers get diagnostics, assets, and maintenance context.
```

## 4. Real-Time Overview

On `Overview`, point out:

- Backend connection status.
- Live metric cards.
- Real-time telemetry chart.
- Critical alarm summary.
- Active maintenance work.

Point out that there is no raw database page and no unsafe browser-side plant-control panel. Operators only see actions that make sense for the demo: acknowledge alarms, open AI-filtered signals, and update work orders.

## 5. Alarm Triage

Open `Alarm Triage`.

1. Expand `Pump Station A pressure anomaly`.
2. Read the cause and operator action.
3. Click `Acknowledge`.
4. Watch the alarm state update.

Say this:

```text
Traditional HMIs show alarms as a long noisy list. This view ranks alarms by risk and gives the operator a clear next action.
```

## 6. AI Copilot

Click the floating `AI Copilot` button.

Ask:

```text
what is the energy load
```

Expected answer:

```text
Energy Load is currently around the live dashboard value, with a short safety note only if a critical alarm exists.
```

Then ask:

```text
what should the operator prioritize next
```

Expected answer:

```text
The AI should prioritize the critical pump pressure alarm and suggest a practical operator action.
```

Say this:

```text
The AI is an overlay, not a separate page. For direct metric questions, it answers the exact metric first. For priority questions, it switches to safety triage.
```

## 7. AI-Filtered Notifications

Click the bell in the header.

1. Click a notification that links to alarms, AI, or assets.
2. Mark a notification as read.
3. Refresh and show that the read state remains.

Say this:

```text
Notifications are AI-filtered into a pop-up action center. Critical and unread signals float to the top instead of appearing as a confusing raw list.
```

## 8. Assets And Maintenance

Open `Assets`.

1. Start an open work order.
2. Complete an in-progress work order.
3. Refresh and show the status remains updated.

Say this:

```text
Maintenance actions are database-backed, so shift teams can see current work instead of relying on screenshots or manual notes.
```

## 9. Real Data Injection

Run this from PowerShell to simulate a device pushing live telemetry:

```powershell
Invoke-WebRequest `
  -Uri https://neurocontrol-ai.onrender.com/api/ingest/telemetry `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"pressure":99,"temperature":78,"flow":88,"energyLoad":69}' `
  -UseBasicParsing
```

Refresh or watch the dashboard update.

Say this:

```text
This same endpoint can receive values from Raspberry Pi, Arduino, Node-RED, MQTT gateways, OPC UA bridges, or PLC integration scripts.
```

## 10. Manually Hike Backend Values

Use this when you need the demo to become obviously critical:

```powershell
Invoke-WebRequest `
  -Uri https://neurocontrol-ai.onrender.com/api/demo/hike `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"pressure":106,"temperature":83,"flow":72,"energyLoad":91,"riskIndex":48}' `
  -UseBasicParsing
```

Then refresh the dashboard or wait for the live stream.

Expected result:

```text
Pressure becomes high.
Energy Load becomes 91%.
Risk Index becomes critical.
Pump Station A becomes the top priority alarm.
An AI-filtered critical notification appears.
```

## 11. Closing Line

Say this:

```text
The final product is a next-gen HMI: cleaner than a traditional control screen, smarter with AI prioritization, safer through alarm triage, and practical because the backend, database, and real-time data flow are working.
```
