import { useEffect, useMemo, useState } from 'react';
import {
  AiAssistantPanel,
  AlarmQueue,
  AppHeader,
  AssetPanel,
  ControlPanel,
  defaultViews,
  MetricGrid,
  ProcessOverview,
  Sidebar,
  TelemetryChart,
  ViewTabs,
  WorkOrderPanel,
} from './components/DashboardShell';
import {
  activity,
  initialAlarms,
  metricCards,
  processStages,
  roles,
} from './data/dashboardData';
import {
  acknowledgeAlarm as acknowledgeAlarmRequest,
  askAiAssistant,
  createDashboardStream,
  fetchDashboard,
  fetchHealth,
  getApiBaseUrl,
  setControlMode,
} from './services/api';
import './App.css';

function createTelemetryPoint(index = 0) {
  const now = new Date();
  now.setSeconds(now.getSeconds() - (9 - index) * 3);

  return {
    time: now.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    pressure: Math.round((83 + Math.sin(index / 2) * 6 + Math.random() * 4) * 10) / 10,
    temperature: Math.round((74 + Math.cos(index / 3) * 4 + Math.random() * 3) * 10) / 10,
    flow: Math.round((91 + Math.sin(index / 1.5) * 5 + Math.random() * 4) * 10) / 10,
  };
}

function App() {
  const [selectedRole, setSelectedRole] = useState('operator');
  const [activeView, setActiveView] = useState('overview');
  const [expandedAlarm, setExpandedAlarm] = useState(1);
  const [alarms, setAlarms] = useState(initialAlarms);
  const [metrics, setMetrics] = useState(metricCards);
  const [stages, setStages] = useState(processStages);
  const [activityItems, setActivityItems] = useState(activity);
  const [controlState, setControlState] = useState({
    mode: 'Normal operation',
  });
  const [aiQuestion, setAiQuestion] = useState('What should the operator prioritize next?');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiProvider, setAiProvider] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    database: 'fallback',
    url: getApiBaseUrl(),
  });
  const [telemetry, setTelemetry] = useState(() =>
    Array.from({ length: 10 }, (_, index) => createTelemetryPoint(index))
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncBackend() {
      try {
        const [health, dashboard] = await Promise.all([fetchHealth(), fetchDashboard()]);

        if (cancelled) {
          return;
        }

        setApiStatus({
          connected: true,
          database: health.database?.driver || 'connected',
          url: getApiBaseUrl(),
        });
        setMetrics(dashboard.metrics?.length ? dashboard.metrics : metricCards);
        setStages(dashboard.processStages?.length ? dashboard.processStages : processStages);
        setActivityItems(dashboard.activity?.length ? dashboard.activity : activity);
        setAlarms(dashboard.alarms?.length ? dashboard.alarms : initialAlarms);
        setControlState(dashboard.controlState || { mode: 'Normal operation' });
        if (dashboard.telemetry?.length) {
          setTelemetry(dashboard.telemetry);
        }
      } catch (error) {
        if (!cancelled) {
          setApiStatus({
            connected: false,
            database: 'fallback',
            url: getApiBaseUrl(),
            error: error.message,
          });
        }
      }
    }

    syncBackend();
    const interval = setInterval(syncBackend, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!apiStatus.connected) {
      return undefined;
    }

    const stream = createDashboardStream();
    if (!stream) {
      return undefined;
    }

    const handleTelemetry = (event) => {
      const payload = JSON.parse(event.data);
      const dashboard = payload.dashboard;
      if (dashboard?.telemetry?.length) {
        setTelemetry(dashboard.telemetry);
      }
      if (dashboard?.alarms?.length) {
        setAlarms(dashboard.alarms);
      }
      if (dashboard?.metrics?.length) {
        setMetrics(dashboard.metrics);
      }
      if (dashboard?.processStages?.length) {
        setStages(dashboard.processStages);
      }
      if (dashboard?.controlState) {
        setControlState(dashboard.controlState);
      }
    };

    stream.addEventListener('telemetry', handleTelemetry);
    stream.onerror = () => {
      stream.close();
    };

    return () => {
      stream.removeEventListener('telemetry', handleTelemetry);
      stream.close();
    };
  }, [apiStatus.connected]);

  useEffect(() => {
    if (apiStatus.connected) {
      return undefined;
    }

    let tick = 10;
    const interval = setInterval(() => {
      setTelemetry((points) => [...points.slice(1), createTelemetryPoint(tick)]);
      tick += 1;
    }, 3000);

    return () => clearInterval(interval);
  }, [apiStatus.connected]);

  const visibleAlarms = useMemo(() => {
    const role = roles.find((item) => item.id === selectedRole) || roles[0];
    return alarms.filter((alarm) => role.allowedSeverities.includes(alarm.severity));
  }, [alarms, selectedRole]);

  const unacknowledgedCount = alarms.filter((alarm) => !alarm.acknowledged).length;

  const handleToggleAlarm = (alarmId) => {
    setExpandedAlarm((current) => (current === alarmId ? null : alarmId));
  };

  const handleAcknowledge = async (alarmId) => {
    setAlarms((items) =>
      items.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
      )
    );

    if (!apiStatus.connected) {
      return;
    }

    try {
      const updatedAlarm = await acknowledgeAlarmRequest(alarmId);
      setAlarms((items) =>
        items.map((alarm) =>
          alarm.id === alarmId ? { ...alarm, ...updatedAlarm } : alarm
        )
      );
    } catch (error) {
      setApiStatus((current) => ({
        ...current,
        connected: false,
        database: 'fallback',
        error: error.message,
      }));
    }
  };

  const handleModeChange = async (mode) => {
    setControlState((current) => ({ ...current, mode }));

    if (!apiStatus.connected) {
      return;
    }

    try {
      await setControlMode(mode);
    } catch (error) {
      setApiStatus((current) => ({
        ...current,
        connected: false,
        database: 'fallback',
        error: error.message,
      }));
    }
  };

  const handleAskAi = async () => {
    setAiLoading(true);
    try {
      const result = await askAiAssistant(aiQuestion);
      setAiAnswer(result.answer);
      setAiProvider(result.provider);
    } catch (error) {
      setAiProvider('local-ui');
      setAiAnswer(`Use the active alarm queue first. Critical alarms should be acknowledged only after the recommended action is assigned. API error: ${error.message}.`);
    } finally {
      setAiLoading(false);
    }
  };

  const renderActiveView = () => {
    if (activeView === 'alarms') {
      return (
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <AlarmQueue
              alarms={visibleAlarms}
              expandedAlarm={expandedAlarm}
              onToggleAlarm={handleToggleAlarm}
              onAcknowledge={handleAcknowledge}
            />
          </div>
          <div className="dashboard-side">
            <ControlPanel
              currentMode={controlState.mode}
              onSetMode={handleModeChange}
            />
            <WorkOrderPanel />
          </div>
        </div>
      );
    }

    if (activeView === 'ai') {
      return (
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <AiAssistantPanel
              question={aiQuestion}
              answer={aiAnswer}
              provider={aiProvider}
              isLoading={aiLoading}
              onQuestionChange={setAiQuestion}
              onAsk={handleAskAi}
            />
            <AlarmQueue
              alarms={visibleAlarms}
              expandedAlarm={expandedAlarm}
              onToggleAlarm={handleToggleAlarm}
              onAcknowledge={handleAcknowledge}
            />
          </div>
          <div className="dashboard-side">
            <TelemetryChart data={telemetry} />
          </div>
        </div>
      );
    }

    if (activeView === 'assets') {
      return (
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <AssetPanel stages={stages} metrics={metrics} />
            <ProcessOverview stages={stages} />
          </div>
          <div className="dashboard-side">
            <WorkOrderPanel />
            <ControlPanel
              currentMode={controlState.mode}
              onSetMode={handleModeChange}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <ProcessOverview stages={stages} />
          <TelemetryChart data={telemetry} />
          <AlarmQueue
            alarms={visibleAlarms}
            expandedAlarm={expandedAlarm}
            onToggleAlarm={handleToggleAlarm}
            onAcknowledge={handleAcknowledge}
          />
        </div>

        <div className="dashboard-side">
          <ControlPanel
            currentMode={controlState.mode}
            onSetMode={handleModeChange}
          />
          <WorkOrderPanel />
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
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <AppHeader
        currentTime={currentTime}
        activeAlarmCount={unacknowledgedCount}
        apiStatus={apiStatus}
      />
      <div className="workspace">
        <Sidebar
          roles={roles}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          activity={activityItems}
        />

        <main className="dashboard" aria-label="Industrial control dashboard">
          <ViewTabs views={defaultViews} activeView={activeView} onChange={setActiveView} />
          <MetricGrid metrics={metrics} />
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
