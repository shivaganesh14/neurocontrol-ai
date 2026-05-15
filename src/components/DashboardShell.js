import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Cpu,
  Database,
  Factory,
  Gauge,
  Map,
  RadioTower,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const roleIcons = {
  operator: User,
  supervisor: Users,
  engineer: Settings2,
};

const severityRank = {
  critical: 0,
  warning: 1,
  medium: 2,
};

export function AppHeader({ currentTime, activeAlarmCount, apiStatus }) {
  const apiConnected = apiStatus?.connected;
  const databaseLabel = apiStatus?.database || 'fallback';

  return (
    <header className="app-header">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <Activity size={24} />
        </div>
        <div>
          <p className="eyebrow">NeuroControl AI</p>
          <h1>Industrial Control Room</h1>
        </div>
      </div>

      <div className="header-status">
        <div className={`header-pill ${apiConnected ? 'header-pill--online' : 'header-pill--offline'}`}>
          <RadioTower size={16} />
          <span>{apiConnected ? 'Backend Connected' : 'Demo Fallback'}</span>
        </div>
        <div className="header-pill">
          <Database size={16} />
          <span>DB {databaseLabel}</span>
        </div>
        <div className="header-clock" aria-label="System time">
          <Clock3 size={17} />
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
        <div className="notification-pill" aria-label={`${activeAlarmCount} unacknowledged alarms`}>
          <Bell size={17} />
          <strong>{activeAlarmCount}</strong>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ roles, selectedRole, onSelectRole, activity }) {
  return (
    <aside className="sidebar">
      <section className="panel-block">
        <div className="section-title">
          <ShieldCheck size={16} />
          <span>Role View</span>
        </div>
        <div className="role-stack" role="tablist" aria-label="Dashboard role">
          {roles.map((role) => {
            const Icon = roleIcons[role.id] || User;
            const selected = selectedRole === role.id;

            return (
              <button
                className={`role-button ${selected ? 'is-selected' : ''}`}
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                role="tab"
                aria-selected={selected}
              >
                <Icon size={18} />
                <span>
                  <strong>{role.label}</strong>
                  <small>{role.description}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel-block">
        <div className="section-title">
          <Gauge size={16} />
          <span>Plant Snapshot</span>
        </div>
        <dl className="snapshot-list">
          <div>
            <dt>Systems Online</dt>
            <dd className="is-good">24/25</dd>
          </div>
          <div>
            <dt>Safety Interlocks</dt>
            <dd className="is-good">Armed</dd>
          </div>
          <div>
            <dt>Open Work Orders</dt>
            <dd>7</dd>
          </div>
        </dl>
      </section>

      <section className="panel-block">
        <div className="section-title">
          <Clock3 size={16} />
          <span>Recent Activity</span>
        </div>
        <div className="activity-list">
          {activity.map((item) => (
            <article className="activity-item" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
              <time>{item.time}</time>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}

export function MetricGrid({ metrics }) {
  return (
    <section className="metric-grid" aria-label="Key production metrics">
      {metrics.map((metric) => (
        <article className={`metric-card metric-card--${metric.tone}`} key={metric.id}>
          <p>{metric.label}</p>
          <div>
            <strong>{metric.value}</strong>
            <span>{metric.delta}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export function ViewTabs({ views, activeView, onChange }) {
  return (
    <nav className="view-tabs" aria-label="Dashboard views">
      {views.map((view) => {
        const selected = activeView === view.id;
        const Icon = view.icon;
        return (
          <button
            className={`view-tab ${selected ? 'is-selected' : ''}`}
            key={view.id}
            onClick={() => onChange(view.id)}
            aria-current={selected ? 'page' : undefined}
          >
            <Icon size={17} />
            <span>{view.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export const defaultViews = [
  { id: 'overview', label: 'Overview', icon: Map },
  { id: 'alarms', label: 'Alarm Triage', icon: AlertTriangle },
  { id: 'ai', label: 'AI Copilot', icon: Bot },
  { id: 'assets', label: 'Assets', icon: Factory },
];

export function ControlPanel({ currentMode, onSetMode, disabled }) {
  const modes = ['Normal operation', 'Critical response', 'Energy save'];

  return (
    <section className="content-panel control-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Active Control</p>
          <h2>Operating Mode</h2>
        </div>
        <SlidersHorizontal size={18} />
      </div>

      <div className="mode-grid">
        {modes.map((mode) => (
          <button
            className={`mode-button ${currentMode === mode ? 'is-selected' : ''}`}
            key={mode}
            onClick={() => onSetMode(mode)}
            disabled={disabled}
          >
            {mode}
          </button>
        ))}
      </div>
    </section>
  );
}

export function AiAssistantPanel({
  question,
  answer,
  provider,
  isLoading,
  onQuestionChange,
  onAsk,
}) {
  return (
    <section className="content-panel ai-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AI Copilot</p>
          <h2>Operator Decision Support</h2>
        </div>
        <Bot size={18} />
      </div>

      <div className="ai-input-row">
        <textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ask what to prioritize next..."
          rows={3}
        />
        <button className="primary-action" onClick={onAsk} disabled={isLoading}>
          <Send size={16} />
          {isLoading ? 'Analyzing' : 'Ask AI'}
        </button>
      </div>

      <article className="ai-answer">
        <strong>{provider ? `Provider: ${provider}` : 'Ready'}</strong>
        <p>{answer || 'Ask the copilot for the safest next action, root-cause hints, or shift summary.'}</p>
      </article>
    </section>
  );
}

export function AssetPanel({ stages, metrics }) {
  return (
    <section className="content-panel asset-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Asset Intelligence</p>
          <h2>Line Health</h2>
        </div>
        <Factory size={18} />
      </div>

      <div className="asset-grid">
        {stages.map((stage) => (
          <article className={`asset-tile asset-tile--${stage.status}`} key={stage.id}>
            <span className="status-dot" />
            <strong>{stage.label}</strong>
            <small>{stage.value}</small>
          </article>
        ))}
      </div>

      <div className="asset-metric-row">
        {metrics.slice(0, 3).map((metric) => (
          <span key={metric.id}>
            <strong>{metric.value}</strong>
            {metric.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ProcessOverview({ stages }) {
  return (
    <section className="content-panel process-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Process Map</p>
          <h2>Production Line State</h2>
        </div>
        <span className="panel-tag">Auto balanced</span>
      </div>

      <div className="process-flow" aria-label="Production stages">
        {stages.map((stage, index) => (
          <div className="process-step-wrap" key={stage.id}>
            <article className={`process-step process-step--${stage.status}`}>
              <span className="status-dot" />
              <strong>{stage.label}</strong>
              <small>{stage.value}</small>
            </article>
            {index < stages.length - 1 && <span className="flow-line" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TelemetryChart({ data }) {
  return (
    <section className="content-panel telemetry-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Live Telemetry</p>
          <h2>Pressure, Temperature, Flow</h2>
        </div>
        <div className="legend-row">
          <span><i className="legend-swatch legend-swatch--pressure" />Pressure</span>
          <span><i className="legend-swatch legend-swatch--temperature" />Temperature</span>
          <span><i className="legend-swatch legend-swatch--flow" />Flow</span>
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 18, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="pressureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#dbe3ef" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#65758b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#65758b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 110]} />
            <Tooltip
              cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #dbe3ef',
                borderRadius: 8,
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
              }}
            />
            <Area type="monotone" dataKey="pressure" stroke="#2563eb" fill="url(#pressureFill)" strokeWidth={2.4} dot={false} />
            <Area type="monotone" dataKey="temperature" stroke="#16a34a" fill="url(#temperatureFill)" strokeWidth={2.4} dot={false} />
            <Area type="monotone" dataKey="flow" stroke="#d97706" fill="transparent" strokeWidth={2.4} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function AlarmQueue({ alarms, expandedAlarm, onToggleAlarm, onAcknowledge }) {
  const sortedAlarms = [...alarms].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return (
    <section className="content-panel alarm-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Alarm Queue</p>
          <h2>Active Priorities</h2>
        </div>
        <span className="panel-tag">{alarms.length} visible</span>
      </div>

      <div className="alarm-list">
        {sortedAlarms.map((alarm) => {
          const expanded = expandedAlarm === alarm.id;

          return (
            <article className={`alarm-card alarm-card--${alarm.severity}`} key={alarm.id}>
              <button className="alarm-summary" onClick={() => onToggleAlarm(alarm.id)} aria-expanded={expanded}>
                <span className="alarm-icon">
                  {alarm.acknowledged ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </span>
                <span className="alarm-copy">
                  <span className="alarm-title-row">
                    <strong>{alarm.title}</strong>
                    <span className={`severity-badge severity-badge--${alarm.severity}`}>{alarm.severity}</span>
                  </span>
                  <span>{alarm.description}</span>
                  <small>{alarm.sensor} / {alarm.asset} / {alarm.location} / {alarm.time}</small>
                </span>
                <span className="alarm-chevron" aria-hidden="true">
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {expanded && (
                <div className="alarm-details">
                  <div>
                    <h3>Recommended Action</h3>
                    <p>{alarm.action}</p>
                  </div>
                  <div>
                    <h3>AI Analysis</h3>
                    <p>{alarm.reasoning}</p>
                  </div>
                  {!alarm.acknowledged && (
                    <button className="primary-action" onClick={() => onAcknowledge(alarm.id)}>
                      <CheckCircle2 size={16} />
                      Acknowledge
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function WorkOrderPanel() {
  return (
    <section className="content-panel work-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Maintenance</p>
          <h2>Next Best Work</h2>
        </div>
        <Wrench size={18} />
      </div>

      <div className="work-list">
        <article>
          <Cpu size={18} />
          <div>
            <strong>Controller audit</strong>
            <span>PLC-7 firmware drift detected</span>
          </div>
          <time>Today</time>
        </article>
        <article>
          <TrendingUp size={18} />
          <div>
            <strong>Efficiency review</strong>
            <span>Thermal cell recovery below target</span>
          </div>
          <time>Fri</time>
        </article>
      </div>
    </section>
  );
}
