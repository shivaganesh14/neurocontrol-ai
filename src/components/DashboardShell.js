import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  Briefcase,
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
  TrendingUp,
  User,
  Users,
  Wrench,
  X,
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

export function AppHeader({ currentTime, activeAlarmCount, unreadNotificationCount = 0, apiStatus, onOpenNotifications, onSwitchRole }) {
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
        <button className="header-action" onClick={onSwitchRole}>
          <User size={16} />
          <span>Switch Role</span>
        </button>
        <button
          className="notification-pill"
          aria-label={`${unreadNotificationCount} unread notifications and ${activeAlarmCount} unacknowledged alarms`}
          onClick={onOpenNotifications}
        >
          <Bell size={17} />
          <strong>{unreadNotificationCount || activeAlarmCount}</strong>
        </button>
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
  { id: 'assets', label: 'Assets', icon: Factory },
];

export function LoginScreen({ selectedRole, onSelectRole, onLogin, isLoading }) {
  const loginRoles = [
    {
      id: 'operator',
      title: 'Operator',
      body: 'Critical alarms, guided actions, fast acknowledgement.',
      icon: User,
    },
    {
      id: 'supervisor',
      title: 'Supervisor',
      body: 'Shift overview, warning visibility, work priorities.',
      icon: Users,
    },
    {
      id: 'engineer',
      title: 'Engineer',
      body: 'Full diagnostics, asset state, and control tuning.',
      icon: Briefcase,
    },
  ];

  return (
    <main className="login-screen">
      <section className="login-hero">
        <div className="brand-mark" aria-hidden="true">
          <Activity size={24} />
        </div>
        <p className="eyebrow">Next-Gen Control System Interface</p>
        <h1>NeuroControl AI</h1>
        <p>
          Role-personalized HMI with live data, AI alarm triage, and database-backed operator actions.
        </p>
      </section>

      <section className="login-panel">
        <div>
          <p className="eyebrow">Demo Sign In</p>
          <h2>Select Role</h2>
        </div>
        <div className="login-role-grid">
          {loginRoles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                className={`login-role ${selectedRole === role.id ? 'is-selected' : ''}`}
                key={role.id}
                onClick={() => onSelectRole(role.id)}
              >
                <Icon size={20} />
                <strong>{role.title}</strong>
                <span>{role.body}</span>
              </button>
            );
          })}
        </div>
        <button className="primary-action login-action" onClick={onLogin} disabled={isLoading}>
          <ShieldCheck size={16} />
          {isLoading ? 'Signing in' : 'Enter Control Room'}
        </button>
      </section>
    </main>
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

export function AiCopilotOverlay({
  isOpen,
  question,
  answer,
  provider,
  isLoading,
  onOpen,
  onClose,
  onQuestionChange,
  onAsk,
}) {
  return (
    <>
      <button className="floating-ai-button" onClick={onOpen} aria-label="Open AI copilot">
        <Bot size={18} />
        <span>AI Copilot</span>
      </button>

      {isOpen && (
        <div className="overlay-backdrop" role="presentation" onMouseDown={onClose}>
          <section
            className="copilot-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="AI Copilot"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="overlay-close" onClick={onClose} aria-label="Close AI copilot">
              <X size={18} />
            </button>
            <AiAssistantPanel
              question={question}
              answer={answer}
              provider={provider}
              isLoading={isLoading}
              onQuestionChange={onQuestionChange}
              onAsk={onAsk}
            />
          </section>
        </div>
      )}
    </>
  );
}

export function RoleDashboardIntro({ role, activeAlarmCount, unreadNotificationCount }) {
  const content = {
    operator: {
      label: 'Operator Dashboard',
      title: 'Immediate Safety And Production Actions',
      body: 'Critical alarms, live telemetry, and next work are placed first so the operator can act without hunting through menus.',
    },
    supervisor: {
      label: 'Supervisor Dashboard',
      title: 'Shift Performance And Exceptions',
      body: 'Production target, AI-filtered notifications, warning visibility, and maintenance progress stay together for shift decisions.',
    },
    engineer: {
      label: 'Engineer Dashboard',
      title: 'Diagnostics, Assets, And Root Cause',
      body: 'Asset health, process stages, telemetry, and maintenance state are grouped for investigation and tuning.',
    },
  };
  const current = content[role] || content.operator;

  return (
    <section className={`role-brief role-brief--${role}`}>
      <div>
        <p className="eyebrow">{current.label}</p>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
      </div>
      <dl>
        <div>
          <dt>Open alarms</dt>
          <dd>{activeAlarmCount}</dd>
        </div>
        <div>
          <dt>AI signals</dt>
          <dd>{unreadNotificationCount}</dd>
        </div>
      </dl>
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

export function DatabasePanel({ databaseStatus, apiStatus, onRefresh }) {
  const counts = databaseStatus?.counts || {};
  const actions = databaseStatus?.actions || [];
  const conversations = databaseStatus?.conversations || [];

  return (
    <section className="content-panel database-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Database Proof</p>
          <h2>Live Persistence</h2>
        </div>
        <button className="panel-tag panel-tag-button" onClick={onRefresh}>Refresh</button>
      </div>

      <div className="database-status-grid">
        <article>
          <span>Connection</span>
          <strong>{apiStatus.connected ? 'Connected' : 'Fallback'}</strong>
        </article>
        <article>
          <span>Driver</span>
          <strong>{databaseStatus?.driver || apiStatus.database}</strong>
        </article>
        <article>
          <span>Telemetry Rows</span>
          <strong>{counts.telemetry ?? '-'}</strong>
        </article>
        <article>
          <span>Operator Actions</span>
          <strong>{counts.operator_actions ?? '-'}</strong>
        </article>
      </div>

      <div className="database-columns">
        <div>
          <h3>Recent Actions</h3>
          {actions.length ? actions.map((action, index) => (
            <article className="db-row" key={`${action.actionType}-${index}`}>
              <strong>{action.actionType}</strong>
              <span>{action.createdAt}</span>
            </article>
          )) : <p>No actions recorded yet.</p>}
        </div>
        <div>
          <h3>AI Conversations</h3>
          {conversations.length ? conversations.map((item, index) => (
            <article className="db-row" key={`${item.provider}-${index}`}>
              <strong>{item.provider}</strong>
              <span>{item.question}</span>
            </article>
          )) : <p>No AI questions yet.</p>}
        </div>
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
  const primaryAlarm = sortedAlarms.find((alarm) => !alarm.acknowledged) || sortedAlarms[0];
  const secondaryAlarms = primaryAlarm ? sortedAlarms.filter((alarm) => alarm.id !== primaryAlarm.id) : sortedAlarms;

  if (!primaryAlarm) {
    return (
      <section className="content-panel alarm-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Alarm Triage</p>
            <h2>No Active Alerts</h2>
          </div>
          <CheckCircle2 size={18} />
        </div>
        <p className="empty-state">No visible alarms for this role. Continue monitoring live telemetry.</p>
      </section>
    );
  }

  return (
    <section className="content-panel alarm-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AI Alarm Triage</p>
          <h2>Recognize The Priority First</h2>
        </div>
        <span className="panel-tag">{alarms.length} role-filtered</span>
      </div>

      <article className={`alarm-spotlight alarm-spotlight--${primaryAlarm.severity}`}>
        <div className="spotlight-status">
          <span className={`severity-badge severity-badge--${primaryAlarm.severity}`}>{primaryAlarm.severity}</span>
          <span>{primaryAlarm.acknowledged ? 'Acknowledged' : 'Needs action'}</span>
        </div>
        <div className="spotlight-main">
          <div>
            <h3>{primaryAlarm.title}</h3>
            <p>{primaryAlarm.description}</p>
            <small>{primaryAlarm.sensor} / {primaryAlarm.asset} / {primaryAlarm.location} / {primaryAlarm.time}</small>
          </div>
          <div className="spotlight-action">
            <strong>Recommended Action</strong>
            <p>{primaryAlarm.action}</p>
          </div>
        </div>
        <div className="spotlight-ai">
          <Bot size={17} />
          <span>{primaryAlarm.reasoning}</span>
        </div>
        {!primaryAlarm.acknowledged && (
          <button className="primary-action" onClick={() => onAcknowledge(primaryAlarm.id)}>
            <CheckCircle2 size={16} />
            Acknowledge Priority Alarm
          </button>
        )}
      </article>

      <div className="alert-tile-grid" aria-label="Other visible alarms">
        {secondaryAlarms.map((alarm) => {
          const expanded = expandedAlarm === alarm.id;

          return (
            <article className={`alert-tile alert-tile--${alarm.severity}`} key={alarm.id}>
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

export function WorkOrderPanel({ workOrders = [], onUpdateStatus }) {
  const orders = workOrders.length ? workOrders : [
    {
      id: 'controller-audit',
      title: 'Controller audit',
      asset: 'PLC-7',
      status: 'open',
      due: 'Today',
      recommendation: 'Firmware drift detected',
    },
    {
      id: 'efficiency-review',
      title: 'Efficiency review',
      asset: 'Thermal cell',
      status: 'open',
      due: 'Fri',
      recommendation: 'Recovery below target',
    },
  ];

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
        {orders.map((order, index) => {
          const Icon = index % 2 === 0 ? Cpu : TrendingUp;
          const nextStatus = order.status === 'open' ? 'in_progress' : order.status === 'in_progress' ? 'complete' : 'open';

          return (
            <article key={order.id}>
              <Icon size={18} />
              <div>
                <strong>{order.title}</strong>
                <span>{order.asset} / {order.recommendation}</span>
                <small className={`work-status work-status--${order.status}`}>{order.status.replace('_', ' ')}</small>
              </div>
              <button className="inline-action" onClick={() => onUpdateStatus?.(order.id, nextStatus)}>
                {order.status === 'complete' ? 'Reopen' : order.status === 'in_progress' ? 'Complete' : 'Start'}
              </button>
              <time>{order.due}</time>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function rankNotifications(notifications) {
  const severityWeight = { critical: 0, warning: 1, medium: 2, info: 3 };
  return [...notifications].sort((a, b) => {
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    return (severityWeight[a.severity] ?? 4) - (severityWeight[b.severity] ?? 4);
  });
}

export function AiNotificationPanel({ notifications = [], onRead, onOpenRoute }) {
  const ranked = rankNotifications(notifications).slice(0, 3);

  return (
    <section className="content-panel ai-filter-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AI Filtered Notifications</p>
          <h2>Signals That Need Attention</h2>
        </div>
        <Bell size={18} />
      </div>

      <div className="signal-stack">
        {ranked.length ? ranked.map((item) => (
          <article className={`signal-card signal-card--${item.severity} ${item.read ? 'is-read' : ''}`} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
            <div className="signal-actions">
              <button className="inline-action" onClick={() => onOpenRoute?.(item.route)}>Open</button>
              {!item.read && <button className="inline-action" onClick={() => onRead?.(item.id)}>Read</button>}
            </div>
          </article>
        )) : (
          <p className="empty-state">No AI-filtered notifications right now.</p>
        )}
      </div>
    </section>
  );
}

export function NotificationOverlay({ isOpen, notifications = [], onClose, onRead, onOpenRoute }) {
  if (!isOpen) {
    return null;
  }

  const ranked = rankNotifications(notifications);

  return (
    <div className="overlay-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="notification-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="AI filtered notifications"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="overlay-close" onClick={onClose} aria-label="Close notifications">
          <X size={18} />
        </button>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">AI Filtered Notifications</p>
            <h2>Action Center</h2>
          </div>
          <Bell size={18} />
        </div>

        <div className="notification-popup-list">
          {ranked.length ? ranked.map((item) => (
            <article className={`notification-popup notification-popup--${item.severity} ${item.read ? 'is-read' : ''}`} key={item.id}>
              <span className={`severity-badge severity-badge--${item.severity}`}>{item.severity}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <div className="notification-actions">
                <button className="inline-action" onClick={() => onOpenRoute?.(item.route)}>Open</button>
                {!item.read && <button className="inline-action" onClick={() => onRead?.(item.id)}>Mark read</button>}
              </div>
            </article>
          )) : (
            <p className="empty-state">No notifications. The control room is quiet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export function ShiftTargetPanel() {
  return (
    <section className="content-panel shift-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Shift Target</p>
          <h2>Output Plan</h2>
        </div>
        <span className="panel-tag">On track</span>
      </div>
      <div className="target-gauge" aria-label="Shift output at 87 percent">
        <span>87%</span>
      </div>
      <dl className="target-list">
        <div>
          <dt>Completed</dt>
          <dd>13,920 units</dd>
        </div>
        <div>
          <dt>Remaining</dt>
          <dd>2,080 units</dd>
        </div>
        <div>
          <dt>ETA</dt>
          <dd>18:35</dd>
        </div>
      </dl>
    </section>
  );
}
