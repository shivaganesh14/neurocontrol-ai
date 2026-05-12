-- ========================================
-- NexaControl AI - Production Database Schema
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ========================================
-- Users Table (Supabase Auth Integration)
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'operator' CHECK (role IN ('operator', 'supervisor', 'engineer', 'manager', 'admin')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Factories and Plants
-- ========================================
CREATE TABLE IF NOT EXISTS public.factories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  capacity INTEGER,
  industry_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Machines and Equipment
-- ========================================
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- pump, reactor, conveyor, motor, sensor, valve, etc.
  model TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  installation_date DATE,
  location_x FLOAT,
  location_y FLOAT,
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'maintenance', 'offline')),
  efficiency_percentage INTEGER DEFAULT 100 CHECK (efficiency_percentage >= 0 AND efficiency_percentage <= 100),
  last_maintenance DATE,
  next_maintenance DATE,
  specifications JSONB, -- Store machine-specific specs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Sensor Data (Time Series)
-- ========================================
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL, -- temperature, pressure, vibration, flow, voltage, etc.
  value DECIMAL(10, 4) NOT NULL,
  unit TEXT, -- °C, PSI, Hz, L/min, V, etc.
  threshold_min DECIMAL(10, 4),
  threshold_max DECIMAL(10, 4),
  is_anomaly BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3, 2), -- AI confidence in anomaly detection
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Alerts and Alarms
-- ========================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  priority INTEGER CHECK (priority >= 1 AND priority <= 10),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_positive')),
  is_ai_predicted BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3, 2),
  ai_recommendation TEXT,
  ai_reasoning TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'catastrophic')),
  estimated_time_to_failure INTEGER, -- in hours
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Predictive Maintenance
-- ========================================
CREATE TABLE IF NOT EXISTS public.predictive_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
  model_type TEXT NOT NULL, -- regression, classification, anomaly_detection
  model_version TEXT,
  accuracy DECIMAL(3, 2),
  last_trained TIMESTAMP WITH TIME ZONE,
  training_data_points INTEGER,
  is_active BOOLEAN DEFAULT true,
  model_parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID REFERENCES public.predictive_models(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL, -- failure_probability, efficiency_degradation, maintenance_needed
  predicted_value DECIMAL(10, 4),
  confidence_interval_lower DECIMAL(10, 4),
  confidence_interval_upper DECIMAL(10, 4),
  time_horizon INTEGER, -- hours into future
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Maintenance Records
-- ========================================
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('preventive', 'corrective', 'emergency', 'predictive')),
  description TEXT,
  parts_used JSONB, -- Array of parts with quantities
  cost DECIMAL(10, 2),
  duration_hours INTEGER,
  next_scheduled DATE,
  was_predicted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- AI Assistant Conversations
-- ========================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB, -- Conversation context and machine data
  tokens_used INTEGER,
  response_time_ms INTEGER,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- System Configuration
-- ========================================
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Audit Logs (Compliance)
-- ========================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- Indexes for Performance
-- ========================================

-- Sensor readings indexes
CREATE INDEX idx_sensor_readings_machine_timestamp ON public.sensor_readings(machine_id, timestamp DESC);
CREATE INDEX idx_sensor_readings_anomaly ON public.sensor_readings(is_anomaly, timestamp DESC);
CREATE INDEX idx_sensor_readings_type_timestamp ON public.sensor_readings(sensor_type, timestamp DESC);

-- Alerts indexes
CREATE INDEX idx_alerts_severity_status ON public.alerts(severity, status);
CREATE INDEX idx_alerts_machine_created ON public.alerts(machine_id, created_at DESC);
CREATE INDEX idx_alerts_active ON public.alerts(status) WHERE status = 'active';

-- Machine indexes
CREATE INDEX idx_machines_factory_status ON public.machines(factory_id, status);
CREATE INDEX idx_machines_type ON public.machines(type);

-- Predictions indexes
CREATE INDEX idx_predictions_machine_created ON public.predictions(machine_id, created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action_created ON public.audit_logs(action, created_at DESC);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Factories: Role-based access
CREATE POLICY "Factory access based on role" ON public.factories
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('supervisor', 'manager', 'admin')
    )
  );

-- Machines: Role-based access
CREATE POLICY "Machine access based on role" ON public.machines
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('operator', 'supervisor', 'engineer', 'manager', 'admin')
    )
  );

-- Sensor readings: Real-time access for operators
CREATE POLICY "Sensor readings access" ON public.sensor_readings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('operator', 'supervisor', 'engineer', 'manager', 'admin')
    )
  );

-- Alerts: Role-based filtering
CREATE POLICY "Alerts access based on role" ON public.alerts
  FOR SELECT USING (
    CASE 
      WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'operator' 
        THEN severity = 'critical'
      WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'supervisor'
        THEN severity IN ('critical', 'high')
      ELSE true
    END
  );

-- AI Conversations: User privacy
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================================
-- Triggers for Automatic Timestamps
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_factories_updated_at
  BEFORE UPDATE ON public.factories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_predictive_models_updated_at
  BEFORE UPDATE ON public.predictive_models
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_maintenance_records_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_system_config_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- Initial System Configuration
-- ========================================

INSERT INTO public.system_config (key, value, description) VALUES
('ai_confidence_threshold', '0.75', 'Minimum confidence for AI predictions'),
('alert_auto_escalation_hours', '2', 'Hours before auto-escalating critical alerts'),
('prediction_horizon_hours', '24', 'Default prediction horizon in hours'),
('max_sensor_retention_days', '90', 'Days to retain sensor data'),
('enable_voice_commands', 'true', 'Enable voice control features'),
('openai_model', 'gpt-4', 'OpenAI model for AI assistant');

-- ========================================
-- Sample Data for Demo
-- ========================================

-- Sample Factory
INSERT INTO public.factories (name, location, industry_type) VALUES
('Plant Alpha', 'Houston, TX', 'Chemical Processing'),
('Plant Beta', 'Detroit, MI', 'Automotive Manufacturing');

-- Sample Machines
INSERT INTO public.machines (factory_id, name, type, status, efficiency_percentage) VALUES
((SELECT id FROM public.factories WHERE name = 'Plant Alpha' LIMIT 1), 'Pump Station A', 'pump', 'critical', 45),
((SELECT id FROM public.factories WHERE name = 'Plant Alpha' LIMIT 1), 'Reactor 2', 'reactor', 'critical', 62),
((SELECT id FROM public.factories WHERE name = 'Plant Alpha' LIMIT 1), 'Conveyor B', 'conveyor', 'warning', 78),
((SELECT id FROM public.factories WHERE name = 'Plant Alpha' LIMIT 1), 'Motor C', 'motor', 'warning', 82);

-- Sample Alerts
INSERT INTO public.alerts (machine_id, title, description, severity, is_ai_predicted, ai_recommendation, ai_reasoning) VALUES
((SELECT id FROM public.machines WHERE name = 'Pump Station A' LIMIT 1), 
 'Pressure Overload Critical', 'Pressure reading 45% above normal threshold', 'critical', true,
 'Reduce pump speed by 30% and inspect discharge line immediately',
 'AI analysis indicates 78% probability of bearing failure within 2 hours'),
((SELECT id FROM public.machines WHERE name = 'Reactor 2' LIMIT 1),
 'Temperature Safety Breach', 'Temperature spike detected at 62% efficiency', 'critical', true,
 'Initiate emergency cooling protocol and evacuate area',
 'Temperature patterns suggest imminent safety threshold breach');

-- ========================================
-- Functions for AI Integration
-- ========================================

-- Function to get machine health metrics
CREATE OR REPLACE FUNCTION public.get_machine_health(machine_uuid UUID)
RETURNS TABLE(
  efficiency DECIMAL,
  last_reading TIMESTAMP WITH TIME ZONE,
  anomaly_count BIGINT,
  active_alerts BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.efficiency_percentage::DECIMAL,
    MAX(sr.timestamp) as last_reading,
    COUNT(CASE WHEN sr.is_anomaly = true THEN 1 END) as anomaly_count,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_alerts
  FROM public.machines m
  LEFT JOIN public.sensor_readings sr ON m.id = sr.machine_id
  LEFT JOIN public.alerts a ON m.id = a.machine_id
  WHERE m.id = machine_uuid
  GROUP BY m.id, m.efficiency_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to predict machine failure
CREATE OR REPLACE FUNCTION public.predict_failure(machine_uuid UUID)
RETURNS TABLE(
  failure_probability DECIMAL,
  estimated_hours INTEGER,
  confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_readings AS (
    SELECT 
      value,
      is_anomaly,
      timestamp
    FROM public.sensor_readings 
    WHERE machine_id = machine_uuid 
      AND timestamp > NOW() - INTERVAL '24 hours'
  ),
  anomaly_rate AS (
    SELECT 
      COUNT(CASE WHEN is_anomaly = true THEN 1 END)::DECIMAL / COUNT(*) as rate
    FROM recent_readings
  )
  SELECT 
    LEAST(ar.rate * 100, 99.9) as failure_probability,
    CASE 
      WHEN ar.rate > 0.8 THEN 2
      WHEN ar.rate > 0.5 THEN 8
      WHEN ar.rate > 0.2 THEN 24
      ELSE 72
    END as estimated_hours,
    ar.rate as confidence
  FROM anomaly_rate ar;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
