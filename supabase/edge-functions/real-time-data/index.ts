import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    // Handle different endpoints
    if (path[0] === 'machines') {
      if (req.method === 'GET') {
        const { data: machines } = await supabase
          .from('machines')
          .select(`
            id, name, type, status, efficiency_percentage, location_x, location_y,
            alerts(id, title, severity, status, created_at, ai_recommendation),
            factory_id, factories(name)
          `)
          .order('updated_at', { ascending: false })

        return new Response(
          JSON.stringify({ machines }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (path[0] === 'alerts') {
      if (req.method === 'GET') {
        const { data: alerts } = await supabase
          .from('alerts')
          .select(`
            id, title, description, severity, priority, status, 
            is_ai_predicted, ai_recommendation, ai_reasoning, risk_level,
            created_at, acknowledged_at,
            machines(name, type, factory_id, factories(name))
          `)
          .eq('status', 'active')
          .order('priority', { ascending: true })

        // Group alerts by priority
        const groupedAlerts = {
          critical: alerts?.filter(a => a.severity === 'critical') || [],
          high: alerts?.filter(a => a.severity === 'high') || [],
          medium: alerts?.filter(a => a.severity === 'medium') || [],
          low: alerts?.filter(a => a.severity === 'low') || []
        }

        return new Response(
          JSON.stringify({ 
            alerts: groupedAlerts,
            summary: {
              critical: groupedAlerts.critical.length,
              high: groupedAlerts.high.length,
              medium: groupedAlerts.medium.length,
              low: groupedAlerts.low.length,
              total: alerts?.length || 0
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (req.method === 'POST') {
        const { machineId, title, description, severity, aiRecommendation } = await req.json()

        const { data: alert } = await supabase
          .from('alerts')
          .insert({
            machine_id: machineId,
            title,
            description,
            severity,
            ai_recommendation: aiRecommendation,
            is_ai_predicted: true,
            priority: severity === 'critical' ? 1 : severity === 'high' ? 3 : severity === 'medium' ? 5 : 8
          })
          .select()
          .single()

        return new Response(
          JSON.stringify({ alert }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (path[0] === 'sensor-data') {
      if (req.method === 'GET') {
        const { data: readings } = await supabase
          .from('sensor_readings')
          .select(`
            machine_id, sensor_type, value, unit, timestamp, is_anomaly,
            machines(name, type)
          `)
          .order('timestamp', { ascending: false })
          .limit(100)

        return new Response(
          JSON.stringify({ readings }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (req.method === 'POST') {
        const { machineId, sensorType, value, unit, isAnomaly } = await req.json()

        const { data: reading } = await supabase
          .from('sensor_readings')
          .insert({
            machine_id: machineId,
            sensor_type: sensorType,
            value,
            unit,
            is_anomaly: isAnomaly || false,
            timestamp: new Date().toISOString()
          })
          .select()
          .single()

        // Check for threshold violations and create alerts
        if (isAnomaly) {
          await supabase
            .from('alerts')
            .insert({
              machine_id: machineId,
              title: `Anomaly detected in ${sensorType}`,
              description: `Abnormal ${sensorType} reading: ${value} ${unit}`,
              severity: 'high',
              is_ai_predicted: true,
              ai_recommendation: `Investigate ${sensorType} sensor and check machine calibration`
            })
        }

        return new Response(
          JSON.stringify({ reading }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (path[0] === 'predictions') {
      if (req.method === 'GET') {
        const { data: predictions } = await supabase
          .from('predictions')
          .select(`
            prediction_type, predicted_value, confidence_interval_lower, confidence_interval_upper,
            time_horizon, created_at,
            machines(name, type),
            predictive_models(model_type, accuracy)
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        return new Response(
          JSON.stringify({ predictions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (path[0] === 'system-stats') {
      if (req.method === 'GET') {
        const { data: machines } = await supabase
          .from('machines')
          .select('status, efficiency_percentage')

        const { data: alerts } = await supabase
          .from('alerts')
          .select('severity, status')

        const stats = {
          totalMachines: machines?.length || 0,
          healthyMachines: machines?.filter(m => m.status === 'healthy').length || 0,
          warningMachines: machines?.filter(m => m.status === 'warning').length || 0,
          criticalMachines: machines?.filter(m => m.status === 'critical').length || 0,
          averageEfficiency: machines?.reduce((sum, m) => sum + m.efficiency_percentage, 0) / (machines?.length || 1),
          activeAlerts: alerts?.filter(a => a.status === 'active').length || 0,
          criticalAlerts: alerts?.filter(a => a.status === 'active' && a.severity === 'critical').length || 0
        }

        return new Response(
          JSON.stringify({ stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Real-time Data Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
