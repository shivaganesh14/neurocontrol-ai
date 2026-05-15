const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const PORT = Number(process.env.PORT || 5000);
const DATABASE_URL = process.env.DATABASE_URL || '';
const USE_POSTGRES = DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://');
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

const demoMetrics = [
  ['throughput', 'Throughput', '94.2%', '+2.8%', 'good', 1],
  ['uptime', 'Line Uptime', '99.1%', '24 hr', 'good', 2],
  ['energy', 'Energy Load', '71%', '-4.0%', 'neutral', 3],
  ['risk', 'Risk Index', '18', 'Elevated', 'warn', 4],
];

const demoStages = [
  ['intake', 'Intake', 'stable', '91%', 1],
  ['mixing', 'Mixing', 'stable', '88%', 2],
  ['thermal', 'Thermal', 'watch', '76%', 3],
  ['packaging', 'Packaging', 'stable', '96%', 4],
];

const demoActivity = [
  ['Maintenance ticket closed', 'Pump seal inspection', '15 min ago', 1],
  ['Batch changeover complete', 'Line 1', '42 min ago', 2],
  ['Backup validation passed', 'Historian sync', '1 hr ago', 3],
];

const demoAlarms = [
  [
    'Pump Station A pressure anomaly',
    'critical',
    '2 min ago',
    'Discharge pressure is 15% above the operating envelope.',
    'Reduce pump speed by 20% and inspect the discharge valve position.',
    'The pressure climb is paired with stable motor current, which points to downstream restriction before mechanical failure.',
    'PRS-001',
    'Pump Station A',
    'Utilities Bay 2',
    false,
  ],
  [
    'Heat exchanger temperature drift',
    'warning',
    '6 min ago',
    'Outlet temperature has moved 3.2 deg C above the 30-minute baseline.',
    'Schedule sensor calibration and inspect coolant flow during the next planned pause.',
    'The drift is gradual and not mirrored by flow loss, so calibration or fouling is more likely than acute failure.',
    'TMP-014',
    'HX-04',
    'Process Cell B',
    true,
  ],
  [
    'Conveyor speed inconsistency',
    'medium',
    '13 min ago',
    'Line speed is oscillating between 85% and 95% of the current setpoint.',
    'Inspect the VFD terminal block and confirm encoder alignment.',
    'Repeated short-period variation suggests signal instability rather than product loading.',
    'SPD-003',
    'Conveyor 1',
    'Packaging Line',
    false,
  ],
  [
    'Compressed air reserve trending low',
    'warning',
    '18 min ago',
    'Reserve pressure is projected to cross the low threshold within 22 minutes.',
    'Start standby compressor and verify the isolation valve in Zone C.',
    'Demand rose after Line 2 startup, while compressor recovery remained below expected slope.',
    'AIR-022',
    'Air Header C',
    'Plant Services',
    false,
  ],
];

const controlModes = [
  ['mode', 'Normal operation'],
  ['operator_focus', 'Critical alarms only'],
  ['shift_owner', 'Supervisor'],
];

const demoUsers = {
  operator: {
    name: 'Asha Rao',
    role: 'operator',
    access: ['overview', 'alarms', 'ai'],
  },
  supervisor: {
    name: 'Marcus Lee',
    role: 'supervisor',
    access: ['overview', 'alarms', 'ai', 'assets', 'database'],
  },
  engineer: {
    name: 'Priya Nair',
    role: 'engineer',
    access: ['overview', 'alarms', 'ai', 'assets', 'database'],
  },
};

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1';
}

function toPgPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function createDatabase() {
  if (USE_POSTGRES) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    });

    return {
      type: 'postgres',
      async exec(sql) {
        await pool.query(sql);
      },
      async query(sql, params = []) {
        const result = await pool.query(toPgPlaceholders(sql), params);
        return result.rows;
      },
      async get(sql, params = []) {
        const result = await pool.query(toPgPlaceholders(sql), params);
        return result.rows[0] || null;
      },
      async run(sql, params = []) {
        await pool.query(toPgPlaceholders(sql), params);
      },
    };
  }

  const { DatabaseSync } = await import('node:sqlite');
  const dataDir = path.join(__dirname, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'neurocontrol-demo.db');
  const sqlite = new DatabaseSync(dbPath);
  const normalizeParams = (params) =>
    params.map((value) => (typeof value === 'boolean' ? Number(value) : value));

  return {
    type: 'sqlite',
    path: dbPath,
    async exec(sql) {
      sqlite.exec(sql);
    },
    async query(sql, params = []) {
      return sqlite.prepare(sql).all(...normalizeParams(params));
    },
    async get(sql, params = []) {
      return sqlite.prepare(sql).get(...normalizeParams(params)) || null;
    },
    async run(sql, params = []) {
      sqlite.prepare(sql).run(...normalizeParams(params));
    },
  };
}

async function createSchema(db) {
  const idColumn = db.type === 'postgres' ? 'INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const boolColumn = db.type === 'postgres' ? 'BOOLEAN DEFAULT FALSE' : 'INTEGER DEFAULT 0';
  const timestampDefault = db.type === 'postgres' ? 'TIMESTAMPTZ DEFAULT NOW()' : 'TEXT DEFAULT CURRENT_TIMESTAMP';

  await db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      delta TEXT NOT NULL,
      tone TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS process_stages (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      status TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity (
      id ${idColumn},
      title TEXT NOT NULL,
      meta TEXT NOT NULL,
      time_label TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alarms (
      id ${idColumn},
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      time_label TEXT NOT NULL,
      description TEXT NOT NULL,
      action TEXT NOT NULL,
      reasoning TEXT NOT NULL,
      sensor TEXT NOT NULL,
      asset TEXT NOT NULL,
      location TEXT NOT NULL,
      acknowledged ${boolColumn},
      created_at ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS telemetry (
      id ${idColumn},
      time_label TEXT NOT NULL,
      pressure REAL NOT NULL,
      temperature REAL NOT NULL,
      flow REAL NOT NULL,
      created_at ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS control_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS operator_actions (
      id ${idColumn},
      action_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at ${timestampDefault}
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id ${idColumn},
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      provider TEXT NOT NULL,
      created_at ${timestampDefault}
    );
  `);
}

async function seedIfNeeded(db) {
  const tableCount = async (table) => {
    const result = await db.get(`SELECT COUNT(*) AS count FROM ${table}`);
    return Number(result.count);
  };

  if ((await tableCount('metrics')) === 0) {
    for (const item of demoMetrics) {
      await db.run('INSERT INTO metrics (id, label, value, delta, tone, sort_order) VALUES (?, ?, ?, ?, ?, ?)', item);
    }
  }

  if ((await tableCount('process_stages')) === 0) {
    for (const item of demoStages) {
      await db.run('INSERT INTO process_stages (id, label, status, value, sort_order) VALUES (?, ?, ?, ?, ?)', item);
    }
  }

  if ((await tableCount('activity')) === 0) {
    for (const item of demoActivity) {
      await db.run('INSERT INTO activity (title, meta, time_label, sort_order) VALUES (?, ?, ?, ?)', item);
    }
  }

  if ((await tableCount('alarms')) === 0) {
    for (const item of demoAlarms) {
      await db.run(
        `INSERT INTO alarms
          (title, severity, time_label, description, action, reasoning, sensor, asset, location, acknowledged)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }
  }

  if ((await tableCount('telemetry')) < 10) {
    for (let index = 0; index < 10; index += 1) {
      await insertTelemetryPoint(db, index);
    }
  }

  if ((await tableCount('control_state')) === 0) {
    for (const item of controlModes) {
      await db.run('INSERT INTO control_state (key, value) VALUES (?, ?)', item);
    }
  }
}

async function resetDemoData(db) {
  await db.run('DELETE FROM ai_conversations');
  await db.run('DELETE FROM operator_actions');
  await db.run('DELETE FROM control_state');
  await db.run('DELETE FROM telemetry');
  await db.run('DELETE FROM alarms');
  await db.run('DELETE FROM activity');
  await db.run('DELETE FROM process_stages');
  await db.run('DELETE FROM metrics');
  await seedIfNeeded(db);
}

async function insertTelemetryPoint(db, index = Date.now()) {
  const now = new Date();
  const label = now.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' });
  const pressure = Math.round((83 + Math.sin(index / 2) * 6 + Math.random() * 4) * 10) / 10;
  const temperature = Math.round((74 + Math.cos(index / 3) * 4 + Math.random() * 3) * 10) / 10;
  const flow = Math.round((91 + Math.sin(index / 1.5) * 5 + Math.random() * 4) * 10) / 10;

  await db.run(
    'INSERT INTO telemetry (time_label, pressure, temperature, flow) VALUES (?, ?, ?, ?)',
    [label, pressure, temperature, flow]
  );

  return {
    time: label,
    pressure,
    temperature,
    flow,
  };
}

function mapAlarm(row) {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    time: row.time_label,
    description: row.description,
    action: row.action,
    reasoning: row.reasoning,
    sensor: row.sensor,
    asset: row.asset,
    location: row.location,
    acknowledged: normalizeBoolean(row.acknowledged),
  };
}

async function getDashboard(db) {
  await insertTelemetryPoint(db);

  const metrics = await db.query('SELECT id, label, value, delta, tone FROM metrics ORDER BY sort_order ASC');
  const processStages = await db.query('SELECT id, label, status, value FROM process_stages ORDER BY sort_order ASC');
  const activity = await db.query('SELECT id, title, meta, time_label AS time FROM activity ORDER BY sort_order ASC');
  const alarms = (await db.query('SELECT * FROM alarms ORDER BY id ASC')).map(mapAlarm);
  const controlState = await db.query('SELECT key, value FROM control_state ORDER BY key ASC');
  const telemetryRows = await db.query(`
    SELECT time_label AS time, pressure, temperature, flow
    FROM telemetry
    ORDER BY id DESC
    LIMIT 10
  `);
  const telemetry = telemetryRows.reverse();

  return {
    metrics,
    processStages,
    activity,
    alarms,
    telemetry,
    controlState: Object.fromEntries(controlState.map((item) => [item.key, item.value])),
  };
}

async function recordAction(db, actionType, payload = {}) {
  await db.run(
    'INSERT INTO operator_actions (action_type, payload_json) VALUES (?, ?)',
    [actionType, JSON.stringify(payload)]
  );
}

function buildLocalAiResponse(question, dashboard) {
  const activeAlarms = dashboard.alarms.filter((alarm) => !alarm.acknowledged);
  const critical = activeAlarms.find((alarm) => alarm.severity === 'critical');
  const warningCount = activeAlarms.filter((alarm) => alarm.severity === 'warning').length;
  const latestTelemetry = dashboard.telemetry[dashboard.telemetry.length - 1];
  const focusAlarm = critical || activeAlarms[0];

  if (!focusAlarm) {
    return 'All active alarms are acknowledged. Keep monitoring telemetry, confirm shift targets, and run the next preventive maintenance review.';
  }

  const trend = latestTelemetry
    ? `Latest telemetry is pressure ${latestTelemetry.pressure}, temperature ${latestTelemetry.temperature}, and flow ${latestTelemetry.flow}.`
    : 'Telemetry is not available yet.';

  return [
    `Priority: ${focusAlarm.title}.`,
    `Action: ${focusAlarm.action}.`,
    `Reason: ${focusAlarm.reasoning}.`,
    `There are ${activeAlarms.length} unacknowledged alarms, including ${warningCount} warning-level alarms.`,
    trend,
    question ? `Operator question interpreted as: "${question}".` : 'No operator question was provided.',
  ].join(' ');
}

function extractOpenAiText(data) {
  if (data.output_text) {
    return data.output_text;
  }

  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) {
        parts.push(content.text);
      }
    }
  }

  return parts.join('\n').trim();
}

function extractGeminiText(data) {
  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();
}

async function answerWithGemini(question, dashboard, localAnswer) {
  const model = process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                'You are NeuroControl AI, a next-generation industrial HMI assistant. Give short, practical, safety-first recommendations. Prioritize alarms, explain the reason, and state the next operator action.',
            },
          ],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: JSON.stringify({
                  question,
                  dashboard,
                }),
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  return extractGeminiText(data) || localAnswer;
}

async function answerWithAi(question, dashboard) {
  const localAnswer = buildLocalAiResponse(question, dashboard);

  if (process.env.GEMINI_API_KEY) {
    try {
      return {
        provider: 'gemini',
        answer: await answerWithGemini(question, dashboard, localAnswer),
      };
    } catch (error) {
      return {
        provider: 'local-ai-fallback',
        answer: `${localAnswer} Gemini fallback reason: ${error.message}.`,
      };
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      provider: 'local-ai',
      answer: localAnswer,
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-5.4-mini',
        input: [
          {
            role: 'system',
            content:
              'You are NeuroControl AI, an industrial control-room assistant. Prioritize safety, role clarity, and short operator-ready recommendations. Do not invent sensor data.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              question,
              dashboard,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      provider: 'openai',
      answer: extractOpenAiText(data) || localAnswer,
    };
  } catch (error) {
    return {
      provider: 'local-ai-fallback',
      answer: `${localAnswer} AI provider fallback reason: ${error.message}.`,
    };
  }
}

async function main() {
  const db = await createDatabase();
  await createSchema(db);
  await seedIfNeeded(db);

  const app = express();
  app.use(helmet());
  app.use(compression({
    filter: (req, res) => {
      if (req.headers.accept === 'text/event-stream') {
        return false;
      }
      return compression.filter(req, res);
    },
  }));
  app.use(cors({ origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      service: 'NeuroControl AI Backend',
      status: 'running',
      database: db.type,
      endpoints: [
        '/health',
        '/api/auth/login',
        '/api/dashboard',
        '/api/database',
        '/api/stream',
        '/api/ai/assistant',
        '/api/control/mode',
        '/api/alarms/:id/acknowledge',
      ],
    });
  });

  app.get('/health', async (req, res) => {
    const alarmCount = await db.get('SELECT COUNT(*) AS count FROM alarms');
    res.json({
      status: 'healthy',
      service: 'NeuroControl AI Backend',
      database: {
        status: 'connected',
        driver: db.type,
        path: db.type === 'sqlite' ? db.path : undefined,
      },
      alarmCount: Number(alarmCount.count),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/dashboard', async (req, res, next) => {
    try {
      res.json(await getDashboard(db));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const role = String(req.body.role || 'operator').toLowerCase();
      const user = demoUsers[role] || demoUsers.operator;
      await recordAction(db, 'role_login', user);
      res.json({
        token: `demo-${user.role}-${Date.now()}`,
        user,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/database', async (req, res, next) => {
    try {
      const tables = ['metrics', 'process_stages', 'activity', 'alarms', 'telemetry', 'operator_actions', 'ai_conversations'];
      const counts = {};

      for (const table of tables) {
        const result = await db.get(`SELECT COUNT(*) AS count FROM ${table}`);
        counts[table] = Number(result.count);
      }

      const actions = await db.query(`
        SELECT action_type AS actionType, payload_json AS payload, created_at AS createdAt
        FROM operator_actions
        ORDER BY id DESC
        LIMIT 8
      `);

      const conversations = await db.query(`
        SELECT question, provider, created_at AS createdAt
        FROM ai_conversations
        ORDER BY id DESC
        LIMIT 5
      `);

      const latestTelemetry = await db.get(`
        SELECT time_label AS time, pressure, temperature, flow, created_at AS createdAt
        FROM telemetry
        ORDER BY id DESC
        LIMIT 1
      `);

      res.json({
        driver: db.type,
        connected: true,
        counts,
        latestTelemetry,
        actions: actions.map((action) => ({
          ...action,
          payload: JSON.parse(action.payload || '{}'),
        })),
        conversations,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/alarms/:id/acknowledge', async (req, res, next) => {
    try {
      await db.run('UPDATE alarms SET acknowledged = ? WHERE id = ?', [true, Number(req.params.id)]);
      await recordAction(db, 'acknowledge_alarm', { alarmId: Number(req.params.id) });
      const alarm = await db.get('SELECT * FROM alarms WHERE id = ?', [Number(req.params.id)]);

      if (!alarm) {
        res.status(404).json({ error: 'Alarm not found' });
        return;
      }

      res.json(mapAlarm(alarm));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/control/mode', async (req, res, next) => {
    try {
      const mode = String(req.body.mode || 'Normal operation');
      await db.run('UPDATE control_state SET value = ? WHERE key = ?', [mode, 'mode']);
      await recordAction(db, 'set_control_mode', { mode });
      res.json({
        status: 'updated',
        mode,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/ai/assistant', async (req, res, next) => {
    try {
      const question = String(req.body.question || '').trim();
      const dashboard = await getDashboard(db);
      const result = await answerWithAi(question, dashboard);
      await db.run(
        'INSERT INTO ai_conversations (question, answer, provider) VALUES (?, ?, ?)',
        [question || 'What should I do next?', result.answer, result.provider]
      );
      await recordAction(db, 'ai_assistant_question', { question, provider: result.provider });

      res.json({
        question,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = async () => {
      try {
        const telemetry = await insertTelemetryPoint(db);
        const dashboard = await getDashboard(db);
        res.write(`event: telemetry\n`);
        res.write(`data: ${JSON.stringify({ telemetry, dashboard })}\n\n`);
      } catch (error) {
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
      }
    };

    await send();
    const interval = setInterval(send, 2500);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  });

  app.post('/api/demo/reset', async (req, res, next) => {
    try {
      await resetDemoData(db);
      res.json({
        status: 'reset',
        dashboard: await getDashboard(db),
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
      error: 'Backend error',
      message: process.env.NODE_ENV === 'production' ? 'Unexpected server error' : error.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`NeuroControl AI backend running on port ${PORT} with ${db.type} database`);
  });
}

main().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
