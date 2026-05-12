import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AIRequest {
  message: string
  userId: string
  sessionId?: string
  context?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId, sessionId, context }: AIRequest = await req.json()
    
    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Message and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }))

    // Get user profile and recent conversation history
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single()

    const { data: conversationHistory } = await supabase
      .from('ai_conversations')
      .select('message, response, created_at')
      .eq('user_id', userId)
      .eq('session_id', sessionId || userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get relevant machine data for context
    const { data: machines } = await supabase
      .from('machines')
      .select(`
        id, 
        name, 
        type, 
        status, 
        efficiency_percentage,
        alerts!inner(id, title, severity, status, created_at)
      `)
      .in('status', ['critical', 'warning'])

    // Get critical alerts
    const { data: criticalAlerts } = await supabase
      .from('alerts')
      .select(`
        id, 
        title, 
        description, 
        severity, 
        ai_recommendation,
        ai_reasoning,
        machines!inner(name, type)
      `)
      .eq('status', 'active')
      .in('severity', ['critical', 'high'])
      .order('created_at', { ascending: false })
      .limit(5)

    // Build system context for AI
    const systemContext = `You are an AI assistant for NexaControl AI, an industrial monitoring and control system.

Current User Role: ${profile?.role || 'operator'}

Active Critical Alerts:
${criticalAlerts?.map(alert => 
  `- ${alert.machines.name} (${alert.machines.type}): ${alert.title} - ${alert.severity} severity`
).join('\n') || 'No critical alerts'}

Machine Status:
${machines?.map(machine => 
  `- ${machine.name} (${machine.type}): ${machine.status} - ${machine.efficiency_percentage}% efficiency`
).join('\n') || 'All machines operational'}

Guidelines:
1. Be concise and actionable
2. Focus on safety and efficiency
3. Provide specific recommendations
4. Reference real-time data when available
5. Prioritize critical issues
6. Use industrial terminology appropriately
7. If asked about predictions, provide time-based estimates
8. Always consider the user's role when responding`

    // Build conversation history for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemContext },
      ...(conversationHistory?.map(conv => [
        { role: 'user' as const, content: conv.message },
        { role: 'assistant' as const, content: conv.response }
      ]).flat() || []),
      { role: 'user', content: message }
    ]

    const startTime = Date.now()

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      max_tokens: 500,
      temperature: 0.3,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const responseTime = Date.now() - startTime
    const aiResponse = completion.data.choices[0]?.message?.content || 
      'I apologize, but I encountered an error processing your request.'

    // Calculate tokens used (approximation)
    const tokensUsed = Math.ceil(
      (message.length + aiResponse.length) / 4
    )

    // Store conversation in database
    await supabase.from('ai_conversations').insert({
      user_id: userId,
      session_id: sessionId || userId,
      message,
      response: aiResponse,
      context: {
        machineCount: machines?.length || 0,
        criticalAlerts: criticalAlerts?.length || 0,
        userRole: profile?.role
      },
      tokens_used: tokensUsed,
      response_time_ms: responseTime
    })

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context: {
          machineCount: machines?.length || 0,
          criticalAlerts: criticalAlerts?.length || 0,
          responseTime: `${responseTime}ms`
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('AI Assistant Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
