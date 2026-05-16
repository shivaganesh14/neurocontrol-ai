import { useEffect, useMemo, useState } from 'react';
import {
  AiCopilotOverlay,
  AiNotificationPanel,
  AlarmQueue,
  AppHeader,
  AssetPanel,
  defaultViews,
  LoginScreen,
  MetricGrid,
  NotificationOverlay,
  ProcessOverview,
  RoleDashboardIntro,
  Sidebar,
  ShiftTargetPanel,
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
  login,
  markNotificationRead,
  updateWorkOrderStatus,
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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem('neurocontrol-user')) || null;
    } catch (error) {
      return null;
    }
  });
  const [loginRole, setLoginRole] = useState('operator');
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('operator');
  const [activeView, setActiveView] = useState('overview');
  const [expandedAlarm, setExpandedAlarm] = useState(1);
  const [alarms, setAlarms] = useState(initialAlarms);
  const [metrics, setMetrics] = useState(metricCards);
  const [stages, setStages] = useState(processStages);
  const [activityItems, setActivityItems] = useState(activity);
  const [workOrders, setWorkOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
    if (currentUser?.role) {
      setSelectedRole(currentUser.role);
    }
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;

    async function syncBackend() {
      try {
        const [health, dashboard] = await Promise.all([
          fetchHealth(),
          fetchDashboard(),
        ]);

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
        setWorkOrders(dashboard.workOrders || []);
        setNotifications(dashboard.notifications || []);
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
      if (dashboard?.workOrders) {
        setWorkOrders(dashboard.workOrders);
      }
      if (dashboard?.notifications) {
        setNotifications(dashboard.notifications);
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

  const visibleViews = useMemo(() => {
    const access = currentUser?.access || ['overview', 'alarms'];
    return defaultViews.filter((view) => access.includes(view.id));
  }, [currentUser]);

  const unacknowledgedCount = alarms.filter((alarm) => !alarm.acknowledged).length;
  const unreadNotificationCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!visibleViews.some((view) => view.id === activeView)) {
      setActiveView('overview');
    }
  }, [activeView, visibleViews]);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const result = await login(loginRole);
      setCurrentUser(result.user);
      setSelectedRole(result.user.role);
      window.sessionStorage.setItem('neurocontrol-user', JSON.stringify(result.user));
    } catch (error) {
      const fallbackUser = {
        name: loginRole === 'engineer' ? 'Demo Engineer' : loginRole === 'supervisor' ? 'Demo Supervisor' : 'Demo Operator',
        role: loginRole,
        access: loginRole === 'operator' ? ['overview', 'alarms'] : ['overview', 'alarms', 'assets'],
      };
      setCurrentUser(fallbackUser);
      setSelectedRole(loginRole);
      window.sessionStorage.setItem('neurocontrol-user', JSON.stringify(fallbackUser));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSwitchRole = () => {
    window.sessionStorage.removeItem('neurocontrol-user');
    setCurrentUser(null);
    setActiveView('overview');
    setAiOpen(false);
    setNotificationsOpen(false);
  };

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

  const handleWorkOrderStatus = async (id, status) => {
    setWorkOrders((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item))
    );

    if (!apiStatus.connected) return;

    try {
      const updated = await updateWorkOrderStatus(id, status);
      setWorkOrders((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      setApiStatus((current) => ({ ...current, connected: false, error: error.message }));
    }
  };

  const handleOpenRoute = (route) => {
    if (route === 'ai') {
      setAiOpen(true);
      setNotificationsOpen(false);
      return;
    }

    if (route && visibleViews.some((view) => view.id === route)) {
      setActiveView(route);
    } else {
      setActiveView('overview');
    }
    setNotificationsOpen(false);
  };

  const handleNotificationRead = async (id) => {
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );

    if (!apiStatus.connected) return;

    try {
      const updated = await markNotificationRead(id);
      setNotifications((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
    } catch (error) {
      setApiStatus((current) => ({ ...current, connected: false, error: error.message }));
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
            <AiNotificationPanel
              notifications={notifications}
              onRead={handleNotificationRead}
              onOpenRoute={handleOpenRoute}
            />
            <WorkOrderPanel workOrders={workOrders} onUpdateStatus={handleWorkOrderStatus} />
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
            <TelemetryChart data={telemetry} />
          </div>
          <div className="dashboard-side">
            <WorkOrderPanel workOrders={workOrders} onUpdateStatus={handleWorkOrderStatus} />
            <AiNotificationPanel
              notifications={notifications}
              onRead={handleNotificationRead}
              onOpenRoute={handleOpenRoute}
            />
          </div>
        </div>
      );
    }

    if (currentUser?.role === 'supervisor') {
      return (
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <RoleDashboardIntro
              role={currentUser.role}
              activeAlarmCount={unacknowledgedCount}
              unreadNotificationCount={unreadNotificationCount}
            />
            <TelemetryChart data={telemetry} />
            <ProcessOverview stages={stages} />
            <ShiftTargetPanel />
          </div>
          <div className="dashboard-side">
            <AiNotificationPanel
              notifications={notifications}
              onRead={handleNotificationRead}
              onOpenRoute={handleOpenRoute}
            />
            <WorkOrderPanel workOrders={workOrders} onUpdateStatus={handleWorkOrderStatus} />
          </div>
        </div>
      );
    }

    if (currentUser?.role === 'engineer') {
      return (
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <RoleDashboardIntro
              role={currentUser.role}
              activeAlarmCount={unacknowledgedCount}
              unreadNotificationCount={unreadNotificationCount}
            />
            <AssetPanel stages={stages} metrics={metrics} />
            <ProcessOverview stages={stages} />
            <TelemetryChart data={telemetry} />
          </div>
          <div className="dashboard-side">
            <WorkOrderPanel workOrders={workOrders} onUpdateStatus={handleWorkOrderStatus} />
            <AiNotificationPanel
              notifications={notifications}
              onRead={handleNotificationRead}
              onOpenRoute={handleOpenRoute}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <RoleDashboardIntro
            role={currentUser.role}
            activeAlarmCount={unacknowledgedCount}
            unreadNotificationCount={unreadNotificationCount}
          />
          <AlarmQueue
            alarms={visibleAlarms}
            expandedAlarm={expandedAlarm}
            onToggleAlarm={handleToggleAlarm}
            onAcknowledge={handleAcknowledge}
          />
          <TelemetryChart data={telemetry} />
        </div>

        <div className="dashboard-side">
          <AiNotificationPanel
            notifications={notifications}
            onRead={handleNotificationRead}
            onOpenRoute={handleOpenRoute}
          />
          <WorkOrderPanel workOrders={workOrders} onUpdateStatus={handleWorkOrderStatus} />
          <ProcessOverview stages={stages} />
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="app-shell">
        <LoginScreen
          selectedRole={loginRole}
          onSelectRole={setLoginRole}
          onLogin={handleLogin}
          isLoading={loginLoading}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppHeader
        currentTime={currentTime}
        activeAlarmCount={unacknowledgedCount}
        unreadNotificationCount={unreadNotificationCount}
        apiStatus={apiStatus}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onSwitchRole={handleSwitchRole}
      />
      <div className="workspace">
        <Sidebar
          roles={roles.filter((role) => role.id === currentUser.role)}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          activity={activityItems}
        />

        <main className="dashboard" aria-label="Industrial control dashboard">
          <ViewTabs views={visibleViews} activeView={activeView} onChange={setActiveView} />
          <MetricGrid metrics={metrics} />
          {renderActiveView()}
        </main>
      </div>
      <AiCopilotOverlay
        isOpen={aiOpen}
        question={aiQuestion}
        answer={aiAnswer}
        provider={aiProvider}
        isLoading={aiLoading}
        onOpen={() => setAiOpen(true)}
        onClose={() => setAiOpen(false)}
        onQuestionChange={setAiQuestion}
        onAsk={handleAskAi}
      />
      <NotificationOverlay
        isOpen={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onRead={handleNotificationRead}
        onOpenRoute={handleOpenRoute}
      />
    </div>
  );
}

export default App;
