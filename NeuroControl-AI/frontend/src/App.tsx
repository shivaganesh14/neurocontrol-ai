import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useRealtimeStore } from '@/stores/realtime';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MachinesPage from '@/pages/MachinesPage';
import AlertsPage from '@/pages/AlertsPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import MaintenancePage from '@/pages/MaintenancePage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Services
import { authService } from '@/services/auth';
import { realtimeService } from '@/services/realtime';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const { connectSocket, disconnectSocket } = useRealtimeStore();

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('neurocontrol_token');
        if (token) {
          const user = await authService.validateToken(token);
          if (user) {
            setUser(user);
            setIsAuthenticated(true);
            connectWebSocket(token);
          } else {
            localStorage.removeItem('neurocontrol_token');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setUser, setIsAuthenticated, connectWebSocket]);

  const connectWebSocket = (token: string) => {
    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('authenticated', (data) => {
      console.log('Authenticated via WebSocket:', data);
    });

    newSocket.on('real_time_data', (data) => {
      realtimeService.updateSensorData(data);
    });

    newSocket.on('alert_update', (data) => {
      realtimeService.updateAlerts(data);
    });

    newSocket.on('machine_status_update', (data) => {
      realtimeService.updateMachineStatus(data);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    setSocket(newSocket);
    connectSocket(newSocket);
  };

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        disconnectSocket();
      }
    };
  }, [socket, disconnectSocket]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Initializing NeuroControl AI...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={
            !isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />
          }>
            <Route path="login" element={<LoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route path="/" element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/auth/login" replace />
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="machines" element={<MachinesPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
