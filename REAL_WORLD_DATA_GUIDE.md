# Real-World Data Guide

NeuroControl AI accepts live telemetry through one simple HTTP endpoint:

```text
POST https://neurocontrol-ai.onrender.com/api/ingest/telemetry
```

JSON body:

```json
{
  "pressure": 92.4,
  "temperature": 76.1,
  "flow": 88.6,
  "energyLoad": 69
}
```

The backend stores the telemetry row, updates the dashboard metrics, pushes real-time events to the frontend, and creates notifications when demo safety thresholds are crossed.

## Fast Demo Without Hardware

PowerShell:

```powershell
Invoke-WebRequest `
  -Uri https://neurocontrol-ai.onrender.com/api/ingest/telemetry `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"pressure":99,"temperature":78,"flow":88,"energyLoad":69}' `
  -UseBasicParsing
```

Then open `https://neurocontrol-ai.vercel.app` and check the overview, alarms, AI copilot, and notifications.

## Manual Value Hike For Demo

Use this endpoint when you want to force a clear high-risk moment:

```text
POST https://neurocontrol-ai.onrender.com/api/demo/hike
```

PowerShell:

```powershell
Invoke-WebRequest `
  -Uri https://neurocontrol-ai.onrender.com/api/demo/hike `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"pressure":106,"temperature":83,"flow":72,"energyLoad":91,"riskIndex":48}' `
  -UseBasicParsing
```

This updates live telemetry, hikes energy load and risk index, reopens the Pump Station A critical alarm, and creates an AI-filtered critical notification.

## Real Factory Integration

Use any bridge that can read plant data and send HTTP JSON:

- Raspberry Pi reading GPIO, serial, Modbus, or OPC UA values.
- Arduino or ESP32 sending Wi-Fi HTTP requests.
- Node-RED reading MQTT, OPC UA, or Modbus and posting to the backend.
- PLC or SCADA gateway script converting plant tags into JSON.
- CSV simulator or laptop script for hackathon demos.

Recommended flow:

```text
Sensor or PLC -> Gateway script or Node-RED -> POST /api/ingest/telemetry -> Backend database -> Real-time dashboard
```

## Example Payload Mapping

```text
PLC tag PUMP_A_PRESSURE      -> pressure
PLC tag MOTOR_TEMP_C         -> temperature
PLC tag LINE_FLOW_PERCENT    -> flow
PLC tag PLANT_LOAD_PERCENT   -> energyLoad
```

## Demo Hardware Path

For a quick physical demo:

1. Use Raspberry Pi or ESP32.
2. Read one potentiometer or simulated sensor value.
3. Convert it into `pressure` or `energyLoad`.
4. POST the JSON every 2 seconds.
5. Show the dashboard changing live.

No paid API is required for data flow. AI can run with local logic, and Gemini can be added later with a free Google AI Studio key.
