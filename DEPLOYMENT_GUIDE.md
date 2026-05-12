# 🚀 NexaControl AI - Production Deployment Guide

## 📋 Prerequisites

### Required Accounts
- **Supabase Account** (Free tier sufficient for demo)
- **OpenAI Account** (For AI assistant)
- **GitHub Account** (For deployment)
- **Vercel/Netlify Account** (For frontend hosting)

### Environment Setup
- Node.js 16+ installed
- Git installed
- Modern web browser (Chrome/Edge recommended)

---

## 🗄️ Step 1: Supabase Database Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project name: `nexacontrol-ai`
5. Set database password (save it securely)
6. Select region closest to you
7. Click "Create new project"

### 1.2 Run Database Schema
1. Go to SQL Editor in your Supabase project
2. Copy contents of `supabase/schema.sql`
3. Paste and click "Run"
4. Verify all tables are created

### 1.3 Configure Environment Variables
In Supabase Settings → Environment Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## ⚡ Step 2: Deploy Edge Functions

### 2.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 2.2 Login to Supabase
```bash
supabase login
```

### 2.3 Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.4 Deploy Edge Functions
```bash
cd supabase/edge-functions
supabase functions deploy ai-assistant
supabase functions deploy real-time-data
```

### 2.5 Test Edge Functions
```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-assistant' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello","userId":"test"}'
```

---

## 🎨 Step 3: Frontend Configuration

### 3.1 Update Production HMI
Open `production-hmi.html` and update:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;
```

Get these values from:
- Supabase Project Settings → API → Project URL
- Supabase Project Settings → API → anon public

### 3.2 Test Local Connection
```bash
# Start local server
npx serve . -p 3000
# Open http://localhost:3000/production-hmi.html
```

---

## 🌐 Step 4: Production Deployment

### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts to deploy

### Option B: Netlify
1. Drag `production-hmi.html` to Netlify
2. Configure build settings if needed

### Option C: GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch

---

## 🔧 Step 5: Real IoT Integration

### 5.1 MQTT Broker Setup
Use free MQTT broker like [HiveMQ Cloud](https://www.hivemq.com/cloud/):

```python
# Python MQTT Publisher Example
import paho.mqtt.client as mqtt
import json
import random
import time

# MQTT Configuration
BROKER = "your-broker.hivemq.cloud"
PORT = 8883
USERNAME = "your-username"
PASSWORD = "your-password"

# Machine data simulation
def publish_sensor_data():
    client = mqtt.Client()
    client.username_pw_set(USERNAME, PASSWORD)
    
    client.connect(BROKER, PORT, 60)
    
    while True:
        # Simulate sensor data
        data = {
            "machineId": "machine-1",
            "sensorType": "temperature",
            "value": round(random.uniform(70, 90), 2),
            "unit": "°C",
            "isAnomaly": random.random() > 0.9
        }
        
        client.publish("nexacontrol/sensors", json.dumps(data))
        time.sleep(5)

if __name__ == "__main__":
    publish_sensor_data()
```

### 5.2 Edge Function MQTT Integration
Update `real-time-data/index.ts` to handle MQTT data:

```typescript
// Add MQTT client to Edge Function
import { connect } from "https://deno.land/x/mqtt@0.1.4/deno.ts"

const mqttClient = await connect({
  hostname: "your-broker.hivemq.cloud",
  port: 8883,
  username: Deno.env.get("MQTT_USERNAME"),
  password: Deno.env.get("MQTT_PASSWORD"),
  tls: true
});

await mqttClient.subscribe("nexacontrol/sensors");

mqttClient.onMessage = async (topic, payload) => {
  const data = JSON.parse(new TextDecoder().decode(payload));
  
  // Store in Supabase
  await supabase.from('sensor_readings').insert({
    machine_id: data.machineId,
    sensor_type: data.sensorType,
    value: data.value,
    unit: data.unit,
    is_anomaly: data.isAnomaly
  });
};
```

---

## 🤖 Step 6: AI Configuration

### 6.1 OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to Supabase environment variables
4. Test with Edge Function

### 6.2 Custom AI Prompts
Update AI assistant prompts in `ai-assistant/index.ts`:

```typescript
const systemPrompt = `
You are an expert industrial AI assistant for NexaControl AI.

Your capabilities:
- Predictive maintenance analysis
- Real-time fault diagnosis
- Operational optimization recommendations
- Safety protocol guidance
- Performance trend analysis

Current system context:
- Factory: ${factoryName}
- Total machines: ${machineCount}
- Active alerts: ${alertCount}
- System efficiency: ${efficiency}%

Always provide:
1. Immediate action items
2. Risk assessment
3. Time-based recommendations
4. Safety considerations
`;
```

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 System Health Monitoring
Add monitoring endpoints:

```typescript
// health-check Edge Function
export default async (req) => {
  const { data } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'system_health')
  
  return new Response(JSON.stringify({
    status: 'healthy',
    uptime: process.uptime(),
    database: data ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  }))
}
```

### 7.2 Performance Metrics
Track key metrics:
- API response times
- Database query performance
- AI assistant response quality
- Real-time subscription latency

---

## 🔒 Step 8: Security & Authentication

### 8.1 Row Level Security
Already implemented in schema.sql. Test with different user roles:

```sql
-- Test operator access
INSERT INTO auth.users (id, email) VALUES ('test-operator-id', 'operator@test.com');
INSERT INTO public.profiles (id, role) VALUES ('test-operator-id', 'operator');

-- Verify RLS works
SELECT * FROM public.alerts WHERE auth.uid() = 'test-operator-id';
```

### 8.2 API Security
Add rate limiting to Edge Functions:

```typescript
import { RateLimiterMemory } from "https://deno.land/x/rate-limiter@0.1.5/memory.ts"

const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.headers.get('x-forwarded-for') || 'unknown',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// In Edge Function
try {
  await rateLimiter.consume(req);
} catch (rejRes) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

---

## 📱 Step 9: Mobile & PWA

### 9.1 Progressive Web App
Add PWA manifest:

```json
{
  "name": "NexaControl AI",
  "short_name": "NexaControl",
  "start_url": "/production-hmi.html",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 9.2 Service Worker
Add offline capability:

```javascript
// sw.js
const CACHE_NAME = 'nexacontrol-v1';
const urlsToCache = [
  '/production-hmi.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

---

## 🧪 Step 10: Testing & Validation

### 10.1 Load Testing
```bash
# Install artillery
npm install -g artillery

# Test API endpoints
artillery run load-test.yml
```

### 10.2 Integration Testing
```javascript
// E2E Test Example
describe('NexaControl AI', () => {
  test('Real-time data updates', async () => {
    // Simulate sensor data
    await publishSensorData();
    
    // Verify UI updates
    await expect(page).toHaveTextContaining('New sensor reading');
  });
  
  test('AI assistant responses', async () => {
    await page.fill('[placeholder="Ask about critical issues..."]', 'What are critical issues?');
    await page.click('button:has-text("Send")');
    
    await expect(page.locator('.message.ai')).toBeVisible();
  });
});
```

---

## 📈 Step 11: Scaling & Optimization

### 11.1 Database Optimization
```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_sensor_readings_machine_time 
ON public.sensor_readings(machine_id, timestamp DESC);

-- Partition large tables
CREATE TABLE public.sensor_readings_y2024m01 
PARTITION OF public.sensor_readings
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 11.2 Caching Strategy
```typescript
// Redis caching for frequent queries
import { connect } from "https://deno.land/x/redis@v0.31.0/mod.ts";

const redis = await connect({
  hostname: Deno.env.get("REDIS_HOST"),
  port: parseInt(Deno.env.get("REDIS_PORT") || "6379"),
  password: Deno.env.get("REDIS_PASSWORD")
});

// Cache system stats
const cachedStats = await redis.get("system_stats");
if (cachedStats) {
  return new Response(cachedStats);
}
```

---

## 🎯 Production Checklist

### Before Going Live:
- [ ] All environment variables configured
- [ ] Database schema tested with sample data
- [ ] Edge Functions deployed and tested
- [ ] SSL certificates configured
- [ ] Rate limiting implemented
- [ ] Monitoring and logging setup
- [ ] Backup strategy defined
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation updated

### Post-Deployment:
- [ ] Monitor system performance
- [ ] Set up alerts for failures
- [ ] Regular security updates
- [ ] Performance optimization
- [ ] User feedback collection

---

## 🆘 Troubleshooting

### Common Issues:

**Edge Function Not Responding**
```bash
# Check logs
supabase functions logs ai-assistant

# Redeploy
supabase functions deploy ai-assistant --no-verify-jwt
```

**Database Connection Issues**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'alerts';

-- Test connection
SELECT 1;
```

**Real-time Updates Not Working**
```javascript
// Verify WebSocket connection
supabase.channel('test').subscribe((status) => {
  console.log('Subscription status:', status);
});
```

**AI Assistant Errors**
```typescript
// Add error handling
try {
  const completion = await openai.createChatCompletion({...});
} catch (error) {
  console.error('OpenAI Error:', error);
  return new Response('AI service temporarily unavailable', { status: 503 });
}
```

---

## 📞 Support & Maintenance

### Regular Tasks:
- **Daily**: Monitor system health, check error logs
- **Weekly**: Review performance metrics, update dependencies
- **Monthly**: Security updates, database optimization
- **Quarterly**: Full system audit, backup verification

### Emergency Contacts:
- **System Administrator**: [Contact Info]
- **Database Team**: [Contact Info]
- **AI Service Provider**: OpenAI Support

---

## 🎉 Success Metrics

Your NexaControl AI is production-ready when:

✅ **Real-time Monitoring**: Live sensor data streaming  
✅ **AI Intelligence**: Smart recommendations and predictions  
✅ **Alert Management**: Prioritized notifications with actions  
✅ **User Management**: Role-based access control  
✅ **Scalability**: Handles 1000+ concurrent users  
✅ **Security**: Encrypted data transmission and storage  
✅ **Reliability**: 99.9% uptime with failover  
✅ **Mobile Support**: Works on all devices  

**🚀 Your industrial AI system is now ready for real factory deployment!**
