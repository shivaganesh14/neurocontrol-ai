export const roles = [
  {
    id: 'operator',
    label: 'Operator',
    description: 'Critical response',
    allowedSeverities: ['critical'],
  },
  {
    id: 'supervisor',
    label: 'Supervisor',
    description: 'Shift overview',
    allowedSeverities: ['critical', 'warning'],
  },
  {
    id: 'engineer',
    label: 'Engineer',
    description: 'Full diagnostics',
    allowedSeverities: ['critical', 'warning', 'medium'],
  },
];

export const metricCards = [
  {
    id: 'throughput',
    label: 'Throughput',
    value: '94.2%',
    delta: '+2.8%',
    tone: 'good',
  },
  {
    id: 'uptime',
    label: 'Line Uptime',
    value: '99.1%',
    delta: '24 hr',
    tone: 'good',
  },
  {
    id: 'energy',
    label: 'Energy Load',
    value: '71%',
    delta: '-4.0%',
    tone: 'neutral',
  },
  {
    id: 'risk',
    label: 'Risk Index',
    value: '18',
    delta: 'Elevated',
    tone: 'warn',
  },
];

export const initialAlarms = [
  {
    id: 1,
    title: 'Pump Station A pressure anomaly',
    severity: 'critical',
    time: '2 min ago',
    description: 'Discharge pressure is 15% above the operating envelope.',
    action: 'Reduce pump speed by 20% and inspect the discharge valve position.',
    reasoning: 'The pressure climb is paired with stable motor current, which points to downstream restriction before mechanical failure.',
    sensor: 'PRS-001',
    asset: 'Pump Station A',
    location: 'Utilities Bay 2',
    acknowledged: false,
  },
  {
    id: 2,
    title: 'Heat exchanger temperature drift',
    severity: 'warning',
    time: '6 min ago',
    description: 'Outlet temperature has moved 3.2 deg C above the 30-minute baseline.',
    action: 'Schedule sensor calibration and inspect coolant flow during the next planned pause.',
    reasoning: 'The drift is gradual and not mirrored by flow loss, so calibration or fouling is more likely than acute failure.',
    sensor: 'TMP-014',
    asset: 'HX-04',
    location: 'Process Cell B',
    acknowledged: true,
  },
  {
    id: 3,
    title: 'Conveyor speed inconsistency',
    severity: 'medium',
    time: '13 min ago',
    description: 'Line speed is oscillating between 85% and 95% of the current setpoint.',
    action: 'Inspect the VFD terminal block and confirm encoder alignment.',
    reasoning: 'Repeated short-period variation suggests signal instability rather than product loading.',
    sensor: 'SPD-003',
    asset: 'Conveyor 1',
    location: 'Packaging Line',
    acknowledged: false,
  },
  {
    id: 4,
    title: 'Compressed air reserve trending low',
    severity: 'warning',
    time: '18 min ago',
    description: 'Reserve pressure is projected to cross the low threshold within 22 minutes.',
    action: 'Start standby compressor and verify the isolation valve in Zone C.',
    reasoning: 'Demand rose after Line 2 startup, while compressor recovery remained below expected slope.',
    sensor: 'AIR-022',
    asset: 'Air Header C',
    location: 'Plant Services',
    acknowledged: false,
  },
];

export const processStages = [
  {
    id: 'intake',
    label: 'Intake',
    status: 'stable',
    value: '91%',
  },
  {
    id: 'mixing',
    label: 'Mixing',
    status: 'stable',
    value: '88%',
  },
  {
    id: 'thermal',
    label: 'Thermal',
    status: 'watch',
    value: '76%',
  },
  {
    id: 'packaging',
    label: 'Packaging',
    status: 'stable',
    value: '96%',
  },
];

export const activity = [
  {
    id: 1,
    title: 'Maintenance ticket closed',
    meta: 'Pump seal inspection',
    time: '15 min ago',
  },
  {
    id: 2,
    title: 'Batch changeover complete',
    meta: 'Line 1',
    time: '42 min ago',
  },
  {
    id: 3,
    title: 'Backup validation passed',
    meta: 'Historian sync',
    time: '1 hr ago',
  },
];
