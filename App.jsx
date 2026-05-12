import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Users, Settings, TrendingUp, Clock, ChevronDown, ChevronUp, Filter, Bell, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HMI_Dashboard = () => {
  const [selectedRole, setSelectedRole] = useState('operator');
  const [expandedAlarm, setExpandedAlarm] = useState(null);
  const [liveData, setLiveData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Professional color palette
  const colors = {
    primary: '#1e40af',
    secondary: '#64748b', 
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#dc2626',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textLight: '#64748b'
  };

  // Mock alarm data with professional structure
  const [alarms, setAlarms] = useState([
    {
      id: 1,
      title: 'Pump Station A - Pressure Anomaly',
      severity: 'critical',
      time: '2 min ago',
      description: 'Pressure reading 15% above normal threshold',
      aiAction: 'Reduce pump speed by 20% and check for blockages',
      aiReasoning: 'High pressure indicates potential blockage in discharge line',
      sensor: 'PRS-001',
      location: 'Building A - Floor 2',
      acknowledged: false
    },
    {
      id: 2,
      title: 'Temperature Sensor B - Drift Detected',
      severity: 'warning',
      time: '5 min ago',
      description: 'Temperature variance of 3.2°C from expected range',
      aiAction: 'Schedule sensor calibration within 24 hours',
      aiReasoning: 'Gradual drift suggests sensor aging, not critical failure',
      sensor: 'TMP-002',
      location: 'Building B - Floor 1',
      acknowledged: true
    },
    {
      id: 3,
      title: 'Conveyor System - Speed Inconsistency',
      severity: 'medium',
      time: '12 min ago',
      description: 'Line speed fluctuating between 85-95% of setpoint',
      aiAction: 'Inspect motor controller connections',
      aiReasoning: 'Speed variation indicates electrical interference or wear',
      sensor: 'SPD-003',
      location: 'Production Line 1',
      acknowledged: false
    }
  ]);

  // Role-based filtering
  const roleBasedAlarms = alarms.filter(alarm => {
    if (selectedRole === 'operator') return alarm.severity === 'critical';
    if (selectedRole === 'supervisor') return ['critical', 'warning'].includes(alarm.severity);
    return true; // engineer sees all
  });

  // Generate live chart data
  useEffect(() => {
    const generateDataPoint = () => ({
      time: new Date().toLocaleTimeString(),
      pressure: 85 + Math.random() * 15,
      temperature: 72 + Math.random() * 8,
      flow: 90 + Math.random() * 10
    });

    setLiveData([generateDataPoint(), generateDataPoint(), generateDataPoint()]);
    
    const interval = setInterval(() => {
      setLiveData(prev => {
        const newData = [...prev, generateDataPoint()];
        return newData.slice(-10); // Keep last 10 points
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return colors.danger;
      case 'warning': return colors.warning;
      case 'medium': return colors.primary;
      default: return colors.textLight;
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity) {
      case 'critical': return '#fef2f2';
      case 'warning': return '#fff7ed';
      case 'medium': return '#eff6ff';
      default: return colors.background;
    }
  };

  const toggleAlarmExpansion = (alarmId) => {
    setExpandedAlarm(expandedAlarm === alarmId ? null : alarmId);
  };

  const acknowledgeAlarm = (alarmId) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
    ));
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: colors.background,
      minHeight: '100vh',
      color: colors.text
    }}>
      
      {/* Professional Header */}
      <header style={{
        backgroundColor: colors.surface,
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color={colors.primary} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Control Systems Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: colors.textLight }}>
              Industrial Monitoring & Control Interface
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', color: colors.textLight }}>System Time</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '500' }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color={colors.textLight} />
            <span style={{ 
              backgroundColor: colors.danger, 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '1rem', 
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {alarms.filter(a => !a.acknowledged).length}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color={colors.textLight} />
            <span style={{ fontSize: '0.875rem' }}>John Doe</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 73px)' }}>
        
        {/* Professional Sidebar */}
        <aside style={{
          width: '280px',
          backgroundColor: colors.surface,
          borderRight: '1px solid #e2e8f0',
          padding: '1.5rem'
        }}>
          
          {/* Role Selector */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              User Role
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'operator', label: 'Operator', icon: Users },
                { id: 'supervisor', label: 'Supervisor', icon: Settings },
                { id: 'engineer', label: 'Engineer', icon: Activity }
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: `1px solid ${selectedRole === role.id ? colors.primary : '#e2e8f0'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: selectedRole === role.id ? '#eff6ff' : colors.surface,
                    color: selectedRole === role.id ? colors.primary : colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: selectedRole === role.id ? '500' : '400'
                  }}
                >
                  <role.icon size={18} />
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: colors.textLight }}>Active Alarms</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.danger }}>
                  {alarms.filter(a => !a.acknowledged).length}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: colors.textLight }}>Systems Online</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.success }}>
                  24/25
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: colors.textLight }}>Efficiency</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.primary }}>
                  94%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: colors.textLight }}>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Pump maintenance completed</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} />
                  15 min ago
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.textLight }}>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>System backup successful</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} />
                  1 hour ago
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          
          {/* Live Data Chart */}
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Live System Metrics</h2>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: colors.primary }} />
                  <span>Pressure</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: colors.success }} />
                  <span>Temperature</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: colors.warning }} />
                  <span>Flow Rate</span>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke={colors.textLight} fontSize={12} />
                <YAxis stroke={colors.textLight} fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: colors.surface, 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }} 
                />
                <Line type="monotone" dataKey="pressure" stroke={colors.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temperature" stroke={colors.success} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="flow" stroke={colors.warning} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Alarms Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                Active Alarms ({roleBasedAlarms.length})
              </h2>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                backgroundColor: colors.surface,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <Filter size={16} />
                Filter
              </button>
            </div>

            {/* Alarm Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {roleBasedAlarms.map(alarm => (
                <div
                  key={alarm.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: '0.75rem',
                    border: `1px solid ${getSeverityColor(alarm.severity)}20`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Alarm Header */}
                  <div
                    onClick={() => toggleAlarmExpansion(alarm.id)}
                    style={{
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: getSeverityBg(alarm.severity)
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={20} color={getSeverityColor(alarm.severity)} />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                          {alarm.title}
                        </h3>
                        {alarm.acknowledged && (
                          <span style={{
                            backgroundColor: colors.success,
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: colors.textLight }}>
                        {alarm.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: colors.textLight }}>
                        <span>{alarm.sensor}</span>
                        <span>•</span>
                        <span>{alarm.location}</span>
                        <span>•</span>
                        <span>{alarm.time}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getSeverityColor(alarm.severity),
                        color: 'white',
                        textTransform: 'uppercase'
                      }}>
                        {alarm.severity}
                      </span>
                      {expandedAlarm === alarm.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAlarm === alarm.id && (
                    <div style={{
                      padding: '1.25rem',
                      borderTop: '1px solid #e2e8f0',
                      backgroundColor: colors.background
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: colors.primary }}>
                          Recommended Action
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
                          {alarm.aiAction}
                        </p>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: colors.textLight }}>
                          AI Analysis
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', color: colors.textLight }}>
                          {alarm.aiReasoning}
                        </p>
                      </div>

                      {!alarm.acknowledged && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeAlarm(alarm.id);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          Acknowledge Alarm
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HMI_Dashboard;
