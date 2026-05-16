const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://neurocontrol-ai.onrender.com'
    : 'http://127.0.0.1:5000';

const API_BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function fetchHealth() {
  return request('/health');
}

export function fetchDashboard() {
  return request('/api/dashboard');
}

export function login(role) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export function fetchDatabaseStatus() {
  return request('/api/database');
}

export function acknowledgeAlarm(alarmId) {
  return request(`/api/alarms/${alarmId}/acknowledge`, {
    method: 'POST',
  });
}

export function setControlMode(mode) {
  return request('/api/control/mode', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export function updateWorkOrderStatus(id, status) {
  return request(`/api/work-orders/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export function markNotificationRead(id) {
  return request(`/api/notifications/${id}/read`, {
    method: 'POST',
  });
}

export function askAiAssistant(question) {
  return request('/api/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export function createDashboardStream() {
  if (typeof EventSource === 'undefined') {
    return null;
  }

  return new EventSource(`${API_BASE_URL}/api/stream`);
}
