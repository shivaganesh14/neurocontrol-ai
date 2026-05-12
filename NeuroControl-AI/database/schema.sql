-- ================================================================
-- NeuroControl AI - Production Industrial Database Schema
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
-- Users & Authentication
-- ================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'operator' CHECK (role IN ('operator', 'supervisor', 'maintenance_engineer', 'plant_manager', 'admin')),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Factories & Plants
-- ================================================================

CREATE TABLE IF NOT EXISTS public.factories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    capacity INTEGER,
    industry_type VARCHAR(100),
    plant_manager_id UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Machines & Equipment
-- ================================================================

CREATE TABLE IF NOT EXISTS public.machines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    factory_id UUID REFERENCES public.factories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- pump, reactor, conveyor, motor, sensor, valve, etc.
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date DATE,
    location_x FLOAT,
    location_y FLOAT,
    location_z FLOAT,
    status VARCHAR(50) DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'maintenance', 'offline')),
    efficiency_percentage INTEGER DEFAULT 100 CHECK (efficiency_percentage >= 0 AND efficiency_percentage <= 100),
    last_maintenance DATE,
    next_maintenance DATE,
    specifications JSONB, -- Store machine-specific specs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Sensor Data (Time Series)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.sensor_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
    sensor_type VARCHAR(100) NOT NULL, -- temperature, pressure, vibration, voltage, gas_level, flow_rate
    value DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(20), -- °C, PSI, Hz, V, %, L/min
    threshold_min DECIMAL(10, 4),
    threshold_max DECIMAL(10, 4),
    is_anomaly BOOLEAN DEFAULT false,
    anomaly_score DECIMAL(5, 2), -- AI confidence in anomaly (0.00-1.00)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Alerts & Alarms
-- ================================================================

CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    priority INTEGER CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_positive')),
    is_ai_predicted BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(5, 2),
    ai_recommendation TEXT,
    ai_reasoning TEXT,
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'catastrophic')),
    estimated_time_to_failure INTEGER, -- in hours
    acknowledged_by UUID REFERENCES public.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Maintenance Records
-- ================================================================

CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES public.users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('preventive', 'corrective', 'emergency', 'predictive')),
    description TEXT,
    parts_used JSONB, -- Array of parts with quantities and costs
    labor_hours DECIMAL(5, 2),
    total_cost DECIMAL(10, 2),
    next_scheduled DATE,
    was_predicted BOOLEAN DEFAULT false,
    prediction_accuracy DECIMAL(5, 2), -- How accurate the AI prediction was
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- AI Recommendations
-- ================================================================

CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL, -- maintenance, shutdown, inspection, optimization
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(5, 2),
    priority INTEGER CHECK (priority >= 1 AND priority <= 10),
    estimated_cost_saving DECIMAL(10, 2),
    estimated_downtime_prevented INTEGER, -- in hours
    implementation_steps JSONB, -- Array of implementation steps
    is_implemented BOOLEAN DEFAULT false,
    implemented_by UUID REFERENCES public.users(id),
    implemented_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- When recommendation expires
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Notifications
-- ================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('alert', 'maintenance', 'system', 'ai_recommendation')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500), -- URL to redirect user when clicked
    metadata JSONB, -- Additional notification data
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- User Sessions & Activity
-- ================================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- login, logout, view_alert, acknowledge_alert, etc.
    resource_type VARCHAR(100), -- machine, alert, recommendation, etc.
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- System Configuration
-- ================================================================

CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100), -- ai, alerts, ui, security, etc.
    is_sensitive BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- Performance Indexes for Optimization
-- ================================================================

-- Sensor logs indexes for time-series queries
CREATE INDEX idx_sensor_logs_machine_timestamp ON public.sensor_logs(machine_id, timestamp DESC);
CREATE INDEX idx_sensor_logs_anomaly ON public.sensor_logs(is_anomaly, timestamp DESC);
CREATE INDEX idx_sensor_logs_type_timestamp ON public.sensor_logs(sensor_type, timestamp DESC);
CREATE INDEX idx_sensor_logs_recent ON public.sensor_logs(timestamp DESC) WHERE timestamp > NOW() - INTERVAL '7 days';

-- Alerts indexes for priority-based queries
CREATE INDEX idx_alerts_severity_status ON public.alerts(severity, status);
CREATE INDEX idx_alerts_machine_created ON public.alerts(machine_id, created_at DESC);
CREATE INDEX idx_alerts_active ON public.alerts(status) WHERE status = 'active';
CREATE INDEX idx_alerts_ai_predicted ON public.alerts(is_ai_predicted, created_at DESC);

-- Machine indexes for status queries
CREATE INDEX idx_machines_factory_status ON public.machines(factory_id, status);
CREATE INDEX idx_machines_type ON public.machines(type);
CREATE INDEX idx_machines_efficiency ON public.machines(efficiency_percentage);

-- Maintenance logs indexes
CREATE INDEX idx_maintenance_machine_date ON public.maintenance_logs(machine_id, created_at DESC);
CREATE INDEX idx_maintenance_type ON public.maintenance_logs(type);
CREATE INDEX idx_maintenance_predicted ON public.maintenance_logs(was_predicted);

-- AI recommendations indexes
CREATE INDEX idx_recommendations_user ON public.ai_recommendations(user_id, created_at DESC);
CREATE INDEX idx_recommendations_machine ON public.ai_recommendations(machine_id, created_at DESC);
CREATE INDEX idx_recommendations_implemented ON public.ai_recommendations(is_implemented, created_at DESC);

-- User activity indexes
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id, created_at DESC);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active, expires_at);
CREATE INDEX idx_user_activity_user ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_user_activity_action ON public.user_activity_logs(action, created_at DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON public.notifications(type, created_at DESC);

-- ================================================================
-- Row Level Security (RLS) Policies
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Users can view/update own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Factory access based on role
CREATE POLICY "Factory access based on role" ON public.factories
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('supervisor', 'plant_manager', 'admin')
        )
    );

-- Machine access with role-based filtering
CREATE POLICY "Machine access based on role" ON public.machines
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('operator', 'supervisor', 'maintenance_engineer', 'plant_manager', 'admin')
        )
    );

-- Sensor logs access for operators and above
CREATE POLICY "Sensor logs access" ON public.sensor_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('operator', 'supervisor', 'maintenance_engineer', 'plant_manager', 'admin')
        )
    );

-- Alerts access with severity filtering by role
CREATE POLICY "Alerts access based on role" ON public.alerts
    FOR SELECT USING (
        CASE 
            WHEN (SELECT role FROM public.users WHERE id = auth.uid()) = 'operator' 
                THEN severity = 'critical'
            WHEN (SELECT role FROM public.users WHERE id = auth.uid()) = 'supervisor'
                THEN severity IN ('critical', 'high')
            ELSE true
        END
    );

-- Maintenance logs access
CREATE POLICY "Maintenance logs access" ON public.maintenance_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('maintenance_engineer', 'supervisor', 'plant_manager', 'admin')
        )
    );

-- AI recommendations privacy
CREATE POLICY "Users can view own recommendations" ON public.ai_recommendations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recommendations" ON public.ai_recommendations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications privacy
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- User sessions privacy
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid());

-- User activity logs privacy
CREATE POLICY "Users can view own activity" ON public.user_activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- System config access for admins only
CREATE POLICY "System config admin access" ON public.system_config
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role IN ('admin')
        )
    );

-- ================================================================
-- Triggers for Automatic Timestamps
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
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

CREATE TRIGGER handle_maintenance_logs_updated_at
    BEFORE UPDATE ON public.maintenance_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_ai_recommendations_updated_at
    BEFORE UPDATE ON public.ai_recommendations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_system_config_updated_at
    BEFORE UPDATE ON public.system_config
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- Functions for AI Integration
-- ================================================================

-- Function to get machine health metrics
CREATE OR REPLACE FUNCTION public.get_machine_health(machine_uuid UUID)
RETURNS TABLE(
    efficiency DECIMAL,
    last_reading TIMESTAMP WITH TIME ZONE,
    anomaly_count BIGINT,
    active_alerts BIGINT,
    risk_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.efficiency_percentage::DECIMAL,
        MAX(sl.timestamp) as last_reading,
        COUNT(CASE WHEN sl.is_anomaly = true THEN 1 END) as anomaly_count,
        COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_alerts,
        CASE 
            WHEN m.status = 'critical' THEN 0.9
            WHEN m.status = 'warning' THEN 0.6
            WHEN m.efficiency_percentage < 70 THEN 0.7
            WHEN COUNT(CASE WHEN a.status = 'active' THEN 1 END) > 5 THEN 0.8
            ELSE 0.2
        END as risk_score
    FROM public.machines m
    LEFT JOIN public.sensor_logs sl ON m.id = sl.machine_id
    LEFT JOIN public.alerts a ON m.id = a.machine_id
    WHERE m.id = machine_uuid
    GROUP BY m.id, m.efficiency_percentage, m.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to predict machine failure
CREATE OR REPLACE FUNCTION public.predict_failure_probability(machine_uuid UUID)
RETURNS TABLE(
    failure_probability DECIMAL,
    confidence_interval_lower DECIMAL,
    confidence_interval_upper DECIMAL,
    estimated_hours_to_failure INTEGER,
    risk_factors JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_readings AS (
        SELECT 
            value,
            is_anomaly,
            timestamp,
            sensor_type
        FROM public.sensor_logs 
        WHERE machine_id = machine_uuid 
          AND timestamp > NOW() - INTERVAL '24 hours'
    ),
    anomaly_rate AS (
        SELECT 
            COUNT(CASE WHEN is_anomaly = true THEN 1 END)::DECIMAL / COUNT(*) as rate,
            COUNT(CASE WHEN is_anomaly = true AND sensor_type = 'vibration' THEN 1 END) as vibe_anomalies,
            COUNT(CASE WHEN is_anomaly = true AND sensor_type = 'temperature' THEN 1 END) as temp_anomalies
        FROM recent_readings
    ),
    trend_analysis AS (
        SELECT
            CORR(value, EXTRACT(EPOCH FROM timestamp)) as correlation,
            STDDEV(value) as volatility
        FROM recent_readings
        WHERE sensor_type = 'vibration'
    )
    SELECT 
        LEAST(ar.rate * 100, 99.9) as failure_probability,
        GREATEST(ar.rate * 100 - 10, 0) as confidence_interval_lower,
        LEAST(ar.rate * 100 + 10, 100) as confidence_interval_upper,
        CASE 
            WHEN ar.rate > 0.8 THEN 2
            WHEN ar.rate > 0.6 THEN 8
            WHEN ar.rate > 0.3 THEN 24
            ELSE 72
        END as estimated_hours_to_failure,
        jsonb_build_object(
            'anomaly_rate', ar.rate,
            'vibration_anomalies', ar.vibe_anomalies,
            'temperature_anomalies', ar.temp_anomalies,
            'trend_correlation', ta.correlation,
            'volatility', ta.volatility
        ) as risk_factors
    FROM anomaly_rate ar, trend_analysis ta;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system KPIs
CREATE OR REPLACE FUNCTION public.get_system_kpis(factory_uuid UUID DEFAULT NULL)
RETURNS TABLE(
    total_machines INTEGER,
    healthy_machines INTEGER,
    warning_machines INTEGER,
    critical_machines INTEGER,
    average_efficiency DECIMAL,
    total_alerts BIGINT,
    critical_alerts BIGINT,
    uptime_percentage DECIMAL,
    maintenance_cost_today DECIMAL,
    predicted_failures_24h INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH machine_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy,
            COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning,
            COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical,
            AVG(efficiency_percentage) as avg_eff
        FROM public.machines 
        WHERE factory_uuid IS NULL OR factory_id = factory_uuid
    ),
    alert_stats AS (
        SELECT 
            COUNT(*) as total_alerts,
            COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts
        FROM public.alerts a
        JOIN public.machines m ON a.machine_id = m.id
        WHERE (factory_uuid IS NULL OR m.factory_id = factory_uuid)
          AND a.status = 'active'
          AND a.created_at > NOW() - INTERVAL '24 hours'
    ),
    maintenance_stats AS (
        SELECT 
            COALESCE(SUM(total_cost), 0) as cost_today
        FROM public.maintenance_logs
        WHERE DATE(created_at) = CURRENT_DATE
    )
    SELECT 
        ms.total as total_machines,
        ms.healthy as healthy_machines,
        ms.warning as warning_machines,
        ms.critical as critical_machines,
        ms.avg_eff as average_efficiency,
        als.total_alerts as total_alerts,
        als.critical_alerts as critical_alerts,
        CASE 
            WHEN ms.total > 0 THEN (ms.healthy::DECIMAL / ms.total) * 100
            ELSE 0
        END as uptime_percentage,
        mns.cost_today as maintenance_cost_today,
        (SELECT COUNT(*) FROM public.ai_recommendations 
         WHERE created_at > NOW() - INTERVAL '24 hours'
           AND recommendation_type = 'maintenance') as predicted_failures_24h
    FROM machine_stats ms, alert_stats als, maintenance_stats mns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- Initial System Configuration
-- ================================================================

INSERT INTO public.system_config (key, value, description, category) VALUES
-- AI Configuration
('ai_confidence_threshold', '0.75', 'Minimum confidence for AI predictions', 'ai'),
('ai_model_version', 'gemini-pro', 'Current AI model version', 'ai'),
('ai_max_tokens', '1000', 'Maximum tokens for AI responses', 'ai'),
('ai_temperature_threshold', '5.0', 'Temperature anomaly threshold in °C', 'ai'),
('ai_vibration_threshold', '2.5', 'Vibration anomaly threshold', 'ai'),

-- Alert Configuration
('alert_auto_escalation_hours', '2', 'Hours before auto-escalating critical alerts', 'alerts'),
('alert_duplicate_merge_window', '300', 'Seconds to merge duplicate alerts', 'alerts'),
('alert_max_active_per_machine', '10', 'Maximum active alerts per machine', 'alerts'),
('alert_gas_leak_critical', 'true', 'Treat gas leaks as critical', 'alerts'),

-- UI Configuration
('ui_theme', 'dark', 'Default UI theme', 'ui'),
('ui_refresh_interval', '5', 'Data refresh interval in seconds', 'ui'),
('ui_chart_history_hours', '24', 'Hours of data to show in charts', 'ui'),
('ui_enable_animations', 'true', 'Enable UI animations', 'ui'),

-- System Configuration
('system_timezone', 'UTC', 'Default system timezone', 'system'),
('system_max_sessions_per_user', '5', 'Maximum concurrent sessions per user', 'security'),
('system_session_timeout_hours', '24', 'Session timeout in hours', 'security'),
('system_backup_retention_days', '90', 'Days to retain system backups', 'system');

-- ================================================================
-- Sample Data for Testing
-- ================================================================

-- Sample Factory
INSERT INTO public.factories (name, location, industry_type, capacity) VALUES
('NeuroControl Plant Alpha', 'Houston, Texas', 'Chemical Processing', 500),
('NeuroControl Plant Beta', 'Detroit, Michigan', 'Automotive Manufacturing', 750);

-- Sample Users with different roles
INSERT INTO public.users (email, password_hash, first_name, last_name, role, department) VALUES
('operator@neurocontrol.ai', '$2b$12$hashed_password', 'John', 'Smith', 'operator', 'Operations'),
('supervisor@neurocontrol.ai', '$2b$12$hashed_password', 'Sarah', 'Johnson', 'supervisor', 'Operations'),
('maintenance@neurocontrol.ai', '$2b$12$hashed_password', 'Mike', 'Wilson', 'maintenance_engineer', 'Maintenance'),
('manager@neurocontrol.ai', '$2b$12$hashed_password', 'David', 'Brown', 'plant_manager', 'Management');

-- Sample Machines
INSERT INTO public.machines (factory_id, name, type, model, manufacturer, status, efficiency_percentage, location_x, location_y) VALUES
((SELECT id FROM public.factories WHERE name = 'NeuroControl Plant Alpha' LIMIT 1), 'Reactor Unit A-1', 'reactor', 'RC-2000X', 'Siemens', 'warning', 78, 100, 200),
((SELECT id FROM public.factories WHERE name = 'NeuroControl Plant Alpha' LIMIT 1), 'Pump Station P-3', 'pump', 'PP-1500', 'ABB', 'critical', 45, 150, 300),
((SELECT id FROM public.factories WHERE name = 'NeuroControl Plant Alpha' LIMIT 1), 'Conveyor Line C-2', 'conveyor', 'CL-3000', 'Honeywell', 'healthy', 92, 200, 400),
((SELECT id FROM public.factories WHERE name = 'NeuroControl Plant Alpha' LIMIT 1), 'Motor Assembly M-1', 'motor', 'MA-2500', 'Siemens', 'warning', 82, 300, 200),
((SELECT id FROM public.factories WHERE name = 'NeuroControl Plant Alpha' LIMIT 1), 'Gas Sensor GS-4', 'sensor', 'GS-100', 'Honeywell', 'healthy', 98, 400, 300),
((SELECT id FROM public.factories WHERE name = 'NeuroControl Plant Alpha' LIMIT 1), 'Temperature Sensor TS-5', 'sensor', 'TS-200', 'ABB', 'healthy', 95, 500, 300);

-- Sample Recent Sensor Logs
INSERT INTO public.sensor_logs (machine_id, sensor_type, value, unit, is_anomaly, anomaly_score, timestamp) VALUES
((SELECT id FROM public.machines WHERE name = 'Reactor Unit A-1' LIMIT 1), 'temperature', 87.5, '°C', false, 0.12, NOW() - INTERVAL '5 minutes'),
((SELECT id FROM public.machines WHERE name = 'Reactor Unit A-1' LIMIT 1), 'pressure', 145.2, 'PSI', false, 0.08, NOW() - INTERVAL '4 minutes'),
((SELECT id FROM public.machines WHERE name = 'Pump Station P-3' LIMIT 1), 'vibration', 8.7, 'Hz', true, 0.85, NOW() - INTERVAL '3 minutes'),
((SELECT id FROM public.machines WHERE name = 'Pump Station P-3' LIMIT 1), 'temperature', 95.3, '°C', true, 0.92, NOW() - INTERVAL '2 minutes'),
((SELECT id FROM public.machines WHERE name = 'Conveyor Line C-2' LIMIT 1), 'flow_rate', 450.0, 'L/min', false, 0.15, NOW() - INTERVAL '6 minutes'),
((SELECT id FROM public.machines WHERE name = 'Gas Sensor GS-4' LIMIT 1), 'gas_level', 0.02, '%', false, 0.05, NOW() - INTERVAL '1 minute');

-- Sample Alerts
INSERT INTO public.alerts (machine_id, title, description, severity, priority, is_ai_predicted, ai_confidence, ai_recommendation, ai_reasoning, risk_level, estimated_time_to_failure) VALUES
((SELECT id FROM public.machines WHERE name = 'Pump Station P-3' LIMIT 1), 'Critical Pump Failure Imminent', 'Vibration levels indicate bearing failure within 2 hours', 'critical', 1, true, 0.87, 'Immediate shutdown required. Inspect bearings and lubrication system.', 'AI analysis shows 85% probability of catastrophic bearing failure based on vibration patterns and temperature correlation.', 'catastrophic', 2),
((SELECT id FROM public.machines WHERE name = 'Reactor Unit A-1' LIMIT 1), 'Temperature Anomaly Detected', 'Temperature trending upward with unusual volatility', 'high', 3, true, 0.72, 'Monitor cooling system and prepare for potential shutdown if temperature exceeds 95°C.', 'Multiple sensor readings indicate abnormal heat generation pattern.', 'high', 8),
((SELECT id FROM public.machines WHERE name = 'Motor Assembly M-1' LIMIT 1), 'Efficiency Degradation', 'Motor efficiency dropped by 18% in 24 hours', 'medium', 5, true, 0.65, 'Schedule inspection within 48 hours. Check for electrical issues and mechanical wear.', 'Gradual performance decline suggests developing mechanical or electrical problems.', 'medium', 24);

-- Sample AI Recommendations
INSERT INTO public.ai_recommendations (machine_id, user_id, recommendation_type, title, description, confidence, priority, estimated_cost_saving, estimated_downtime_prevented, implementation_steps) VALUES
((SELECT id FROM public.machines WHERE name = 'Pump Station P-3' LIMIT 1), (SELECT id FROM public.users WHERE role = 'maintenance_engineer' LIMIT 1), 'maintenance', 'Emergency Bearing Replacement', 'Replace pump bearings immediately to prevent catastrophic failure. AI predicts 85% failure probability within 2 hours.', 0.87, 1, 15000.00, 8, '["1. Shutdown pump P-3", "2. Isolate from system", "3. Drain and purge", "4. Disassemble pump housing", "5. Replace bearings and seals", "6. Reassemble and test", "7. Return to service"]'),
((SELECT id FROM public.machines WHERE name = 'Reactor Unit A-1' LIMIT 1), (SELECT id FROM public.users WHERE role = 'supervisor' LIMIT 1), 'inspection', 'Cooling System Inspection', 'Inspect reactor cooling system for blockages or pump failures. Temperature volatility suggests cooling inefficiency.', 0.72, 3, 5000.00, 4, '["1. Verify coolant levels", "2. Check cooling pump operation", "3. Inspect heat exchangers", "4. Test temperature sensors"]');

-- ================================================================
-- Database Views for Common Queries
-- ================================================================

-- View for active alerts with machine info
CREATE OR REPLACE VIEW public.active_alerts_view AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.severity,
    a.priority,
    a.status,
    a.is_ai_predicted,
    a.ai_confidence,
    a.ai_recommendation,
    a.risk_level,
    a.estimated_time_to_failure,
    a.created_at,
    a.acknowledged_at,
    m.name as machine_name,
    m.type as machine_type,
    m.factory_id,
    f.name as factory_name
FROM public.alerts a
JOIN public.machines m ON a.machine_id = m.id
JOIN public.factories f ON m.factory_id = f.id
WHERE a.status = 'active'
ORDER BY a.priority ASC, a.created_at DESC;

-- View for machine health summary
CREATE OR REPLACE VIEW public.machine_health_view AS
SELECT 
    m.id,
    m.name,
    m.type,
    m.status,
    m.efficiency_percentage,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_alerts,
    COUNT(CASE WHEN a.status = 'active' AND a.severity = 'critical' THEN 1 END) as critical_alerts,
    MAX(sl.timestamp) as last_sensor_reading,
    COUNT(CASE WHEN sl.is_anomaly = true AND sl.timestamp > NOW() - INTERVAL '24 hours' THEN 1 END) as anomalies_24h
FROM public.machines m
LEFT JOIN public.alerts a ON m.id = a.machine_id AND a.status = 'active'
LEFT JOIN public.sensor_logs sl ON m.id = sl.machine_id
GROUP BY m.id, m.name, m.type, m.status, m.efficiency_percentage
ORDER BY m.efficiency_percentage ASC;

-- ================================================================
-- Database Statistics and Health Check
-- ================================================================

-- Function to get database statistics
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    table_size_mb DECIMAL,
    index_size_mb DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        n_tup_ins as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname::regclass, tablename::regclass)) as table_size_mb,
        pg_size_pretty(pg_total_relation_size(schemaname::regclass, tablename::regclass) - pg_total_relation_size(schemaname::regclass, tablename::regclass)) as index_size_mb
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname::regclass, tablename::regclass) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
