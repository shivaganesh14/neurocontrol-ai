import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, 
  TrendingUp, Users, Clock, Zap, Settings,
  Thermometer, Gauge, Wind, Battery
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtimeStore } from '@/stores/realtime';
import { useAuthStore } from '@/stores/auth';
import { AlertCard } from '@/components/AlertCard';
import { MachineCard } from '@/components/MachineCard';
import { DigitalTwin } from '@/components/DigitalTwin';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    machines, 
    alerts, 
    sensorData, 
    systemStats, 
    isLoading,
    subscribeToRealtime,
    unsubscribeFromRealtime
  } = useRealtimeStore();

  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    subscribeToRealtime();
    return () => unsubscribeFromRealtime();
  }, [subscribeToRealtime, unsubscribeFromRealtime]);

  // Sample data for charts
  const performanceData = [
    { time: '00:00', efficiency: 92, temperature: 85, pressure: 120 },
    { time: '04:00', efficiency: 88, temperature: 87, pressure: 125 },
    { time: '08:00', efficiency: 95, temperature: 83, pressure: 118 },
    { time: '12:00', efficiency: 91, temperature: 89, pressure: 130 },
    { time: '16:00', efficiency: 87, temperature: 91, pressure: 135 },
    { time: '20:00', efficiency: 93, temperature: 86, pressure: 122 },
  ];

  const alertTrendData = [
    { day: 'Mon', critical: 2, high: 5, medium: 8, low: 12 },
    { day: 'Tue', critical: 1, high: 3, medium: 6, low: 10 },
    { day: 'Wed', critical: 3, high: 7, medium: 9, low: 15 },
    { day: 'Thu', critical: 0, high: 4, medium: 7, low: 11 },
    { day: 'Fri', critical: 2, high: 6, medium: 10, low: 13 },
    { day: 'Sat', critical: 1, high: 2, medium: 4, low: 8 },
    { day: 'Sun', critical: 0, high: 3, medium: 5, low: 9 },
  ];

  const getRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'operator':
        return <OperatorDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'maintenance_engineer':
        return <MaintenanceDashboard />;
      case 'plant_manager':
        return <ManagerDashboard />;
      default:
        return <OperatorDashboard />;
    }
  };

  const OperatorDashboard = () => (
    <div className="space-y-6">
      {/* Critical Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Critical Alerts</h2>
          <Badge variant="destructive" className="animate-pulse">
            {alerts.filter(a => a.severity === 'critical').length} Critical
          </Badge>
        </div>
        <div className="grid gap-4 mt-4">
          {alerts
            .filter(alert => alert.severity === 'critical')
            .slice(0, 3)
            .map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
        </div>
      </motion.div>

      {/* Machine Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Machine Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machines.slice(0, 8).map(machine => (
            <MachineCard 
              key={machine.id} 
              machine={machine} 
              onClick={() => setSelectedMachine(machine)}
            />
          ))}
        </div>
      </motion.div>

      {/* Real-time Sensor Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Sensor Data
            </CardTitle>
            <CardDescription>Live monitoring of critical parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Temperature</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {sensorData.find(d => d.type === 'temperature')?.value || 0}°C
                </div>
                <div className="text-xs text-muted-foreground">Normal: 70-90°C</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Pressure</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {sensorData.find(d => d.type === 'pressure')?.value || 0} PSI
                </div>
                <div className="text-xs text-muted-foreground">Normal: 100-150 PSI</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wind className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Vibration</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {sensorData.find(d => d.type === 'vibration')?.value || 0} Hz
                </div>
                <div className="text-xs text-muted-foreground">Normal: 0-5 Hz</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Battery className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Voltage</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {sensorData.find(d => d.type === 'voltage')?.value || 0}V
                </div>
                <div className="text-xs text-muted-foreground">Normal: 220-240V</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const SupervisorDashboard = () => (
    <div className="space-y-6">
      {/* Team Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Team Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Operators</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={80} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">80% Staffed</p>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alert Response Time</p>
                  <p className="text-2xl font-bold text-foreground">3.2 min</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={65} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Below Target (5 min)</p>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shift Efficiency</p>
                  <p className="text-2xl font-bold text-foreground">94%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <Progress value={94} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Above Average</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Alert Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Alert Management Overview</CardTitle>
            <CardDescription>Alert trends and team response metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                <Bar dataKey="high" stackId="a" fill="#fb923c" />
                <Bar dataKey="medium" stackId="a" fill="#fbbf24" />
                <Bar dataKey="low" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const MaintenanceDashboard = () => (
    <div className="space-y-6">
      {/* Predictive Maintenance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Predictive Maintenance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="glass-effect border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <Badge variant="secondary">High Priority</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pump Station P-3</h3>
              <p className="text-sm text-muted-foreground mb-4">Bearing wear detected - 85% failure probability</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Time to Failure:</span>
                  <span className="font-bold text-orange-500">24 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recommended Action:</span>
                  <span>Immediate Inspection</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-6 w-6 text-yellow-500" />
                <Badge variant="secondary">Medium Priority</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Reactor Unit A-1</h3>
              <p className="text-sm text-muted-foreground mb-4">Efficiency degradation - 72% performance</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Time to Failure:</span>
                  <span className="font-bold text-yellow-500">72 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recommended Action:</span>
                  <span>Schedule within 48h</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Plan Maintenance
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <Badge variant="secondary">Low Priority</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Conveyor Line C-2</h3>
              <p className="text-sm text-muted-foreground mb-4">Routine maintenance due - 92% efficiency</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next Maintenance:</span>
                  <span className="font-bold text-green-500">7 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recommended Action:</span>
                  <span>Routine Check</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Schedule Routine
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Maintenance Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>Scheduled maintenance activities for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { machine: 'Pump Station P-3', date: 'Today', type: 'Emergency', priority: 'critical' },
                { machine: 'Motor Assembly M-1', date: 'Tomorrow', type: 'Corrective', priority: 'high' },
                { machine: 'Reactor Unit A-1', date: 'In 2 days', type: 'Preventive', priority: 'medium' },
                { machine: 'Conveyor Line C-2', date: 'In 5 days', type: 'Routine', priority: 'low' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.priority === 'critical' ? 'bg-red-500' :
                      item.priority === 'high' ? 'bg-orange-500' :
                      item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{item.machine}</p>
                      <p className="text-sm text-muted-foreground">{item.type} Maintenance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{item.date}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const ManagerDashboard = () => (
    <div className="space-y-6">
      {/* Plant KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Plant Performance KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-6 w-6 text-blue-500" />
                <Badge variant="secondary">+5.2%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Overall Efficiency</p>
              <p className="text-3xl font-bold text-foreground">87.3%</p>
              <Progress value={87.3} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <Badge variant="secondary">-12%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Downtime This Month</p>
              <p className="text-3xl font-bold text-foreground">14.5 hrs</p>
              <Progress value={14.5} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Settings className="h-6 w-6 text-purple-500" />
                <Badge variant="secondary">On Target</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Maintenance Cost</p>
              <p className="text-3xl font-bold text-foreground">$45.2k</p>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <Badge variant="secondary">Excellent</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Safety Score</p>
              <p className="text-3xl font-bold text-foreground">98.5%</p>
              <Progress value={98.5} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Risk Analysis & Cost Impact</CardTitle>
            <CardDescription>Comprehensive risk assessment and financial impact analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Risk Distribution</h4>
                <div className="space-y-3">
                  {[
                    { risk: 'Equipment Failure', probability: 15, impact: 'High', cost: '$250k' },
                    { risk: 'Safety Incident', probability: 5, impact: 'Catastrophic', cost: '$1M+' },
                    { risk: 'Production Delay', probability: 25, impact: 'Medium', cost: '$50k' },
                    { risk: 'Quality Issues', probability: 20, impact: 'Low', cost: '$15k' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.risk}</p>
                        <p className="text-sm text-muted-foreground">Impact: {item.impact}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{item.probability}%</p>
                        <p className="text-sm text-muted-foreground">{item.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4">Cost-Benefit Analysis</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.3)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user?.role === 'operator' ? 'Operations Dashboard' :
             user?.role === 'supervisor' ? 'Supervisor Dashboard' :
             user?.role === 'maintenance_engineer' ? 'Maintenance Dashboard' :
             'Plant Manager Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name}. Here's what's happening in your plant.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString()}
          </Badge>
          <Badge variant={systemStats.criticalAlerts > 0 ? "destructive" : "secondary"} className="text-sm">
            {systemStats.criticalAlerts} Critical Alerts
          </Badge>
        </div>
      </motion.div>

      {/* Role-based dashboard content */}
      {getRoleBasedDashboard()}
    </div>
  );
};

export default DashboardPage;
