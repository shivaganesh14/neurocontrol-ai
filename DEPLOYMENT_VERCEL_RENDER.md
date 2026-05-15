# 🚀 NeuroControl AI - Complete Deployment Guide
## Vercel (Frontend) + Render (Backends)

---

## 📋 Project Structure Overview

```
windsurf-project/
├── Frontend (React)              → Deploy to Vercel
│   ├── App.jsx
│   ├── package.json
│   └── vercel.json
├── Backend 1 (Simple Flask)      → Deploy to Render
│   └── backend/
│       ├── app.py
│       ├── requirements.txt
│       └── Procfile
└── Backend 2 (Complex Flask)     → Deploy to Render
    └── NeuroControl-AI/
        └── backend/
            ├── app.py
            ├── requirements.txt
            ├── runtime.txt
            └── app/
```

---

## 🎯 Deployment Architecture

```
┌─────────────────┐
│   Vercel CDN    │ ← Frontend (React)
│   Frontend App  │
└────────┬────────┘
         │ HTTPS
         ├──────────────────┐
         │                  │
    ┌────▼─────┐      ┌────▼─────┐
    │ Render 1 │      │ Render 2 │
    │ Simple   │      │ Complex  │
    │ Flask    │      │ Flask +  │
    │ Backend  │      │ SocketIO │
    └──────────┘      └──────────┘
```

---

## 📦 Prerequisites

### Required Accounts
- **Vercel Account** (Free tier available)
- **Render Account** (Free tier available)
- **GitHub Account** (For deployment)
- **Supabase Account** (For database - optional)

### Local Tools
- Git installed
- Node.js 16+ installed
- Python 3.11+ installed
- Vercel CLI: `npm i -g vercel`

---

## 🔧 Step 1: Prepare Frontend for Vercel

### 1.1 Update Environment Variables
Create `.env.local` in root directory:

```bash
# Frontend Environment Variables
REACT_APP_BACKEND_1_URL=https://backend-1.onrender.com
REACT_APP_BACKEND_2_URL=https://backend-2.onrender.com
REACT_APP_API_KEY=your_api_key_here
```

### 1.2 Update vercel.json
Ensure your `vercel.json` is configured correctly:

```json
{
  "version": 2,
  "name": "neurocontrol-ai",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "installCommand": "npm install",
  "devCommand": "npm start",
  "functions": {},
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_BACKEND_1_URL": "@backend-1-url",
    "REACT_APP_BACKEND_2_URL": "@backend-2-url"
  }
}
```

### 1.3 Build Frontend Locally (Test)
```bash
npm install
npm run build
```

---

## 🐍 Step 2: Prepare Backend 1 (Simple Flask) for Render

### 2.1 Create/Update Procfile
Create `backend/Procfile`:

```bash
web: gunicorn app:app --workers 4 --worker-class sync --bind 0.0.0.0:$PORT
```

### 2.2 Create .env.example
Create `backend/.env.example`:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=your_secret_key_here

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# API Keys
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 2.3 Update app.py for Production
Ensure `backend/app.py` has this at the end:

```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

---

## 🐍 Step 3: Prepare Backend 2 (Complex Flask) for Render

### 3.1 Create Procfile
Create `NeuroControl-AI/backend/Procfile`:

```bash
web: gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app
```

### 3.2 Create .env.example
Create `NeuroControl-AI/backend/.env.example`:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=0
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
SECRET_KEY=your_secret_key_here

# Database
DATABASE_URL=postgresql://user:password@host:port/database
SQLALCHEMY_DATABASE_URI=postgresql://user:password@host:port/database

# JWT
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRES=3600

# AI Services
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# WebSocket
SOCKETIO_ASYNC_MODE=threading
```

### 3.3 Verify runtime.txt
Ensure `NeuroControl-AI/backend/runtime.txt` exists:

```
python-3.11.9
```

### 3.4 Create render.yaml (Optional but Recommended)
Create `NeuroControl-AI/backend/render.yaml`:

```yaml
services:
  - type: web
    name: neurocontrol-backend-complex
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app
    envVars:
      - key: FLASK_ENV
        value: production
      - key: FLASK_DEBUG
        value: 0
      - key: PYTHON_VERSION
        value: 3.11.9
```

---

## 🌐 Step 4: Deploy to Vercel (Frontend)

### 4.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 4.2 Login to Vercel
```bash
vercel login
```

### 4.3 Deploy Frontend
```bash
# From root directory
vercel --prod
```

### 4.4 Configure Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `REACT_APP_BACKEND_1_URL`: Your Render backend 1 URL
   - `REACT_APP_BACKEND_2_URL`: Your Render backend 2 URL

### 4.5 Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🚀 Step 5: Deploy Backend 1 to Render

### 5.1 Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 5.2 Create New Web Service on Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `neurocontrol-backend-simple`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --workers 4 --worker-class sync --bind 0.0.0.0:$PORT`
   - **Root Directory**: `backend`
5. Click "Create Web Service"

### 5.3 Add Environment Variables
In Render Dashboard → your service → Environment:
```bash
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=your_generated_secret_key
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 5.4 Get Backend URL
After deployment, copy the URL (e.g., `https://neurocontrol-backend-simple.onrender.com`)

---

## 🚀 Step 6: Deploy Backend 2 to Render

### 6.1 Create New Web Service on Render
1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `neurocontrol-backend-complex`
   - **Runtime**: Python 3
   - **Python Version**: 3.11.9
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app`
   - **Root Directory**: `NeuroControl-AI/backend`
5. Click "Create Web Service"

### 6.2 Add Environment Variables
In Render Dashboard → your service → Environment:
```bash
FLASK_ENV=production
FLASK_DEBUG=0
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
SECRET_KEY=your_generated_secret_key
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES=3600
CORS_ORIGINS=https://your-frontend.vercel.app
SOCKETIO_ASYNC_MODE=threading
```

### 6.3 Get Backend URL
After deployment, copy the URL (e.g., `https://neurocontrol-backend-complex.onrender.com`)

---

## 🔗 Step 7: Update Frontend with Backend URLs

### 7.1 Update Vercel Environment Variables
Go to Vercel Dashboard → Settings → Environment Variables:
```bash
REACT_APP_BACKEND_1_URL=https://neurocontrol-backend-simple.onrender.com
REACT_APP_BACKEND_2_URL=https://neurocontrol-backend-complex.onrender.com
```

### 7.2 Redeploy Frontend
```bash
vercel --prod
```

---

## ✅ Step 8: Test Deployment

### 8.1 Test Frontend
```bash
# Open your Vercel URL
# Example: https://neurocontrol-ai.vercel.app
```

### 8.2 Test Backend 1
```bash
# Test health endpoint
curl https://neurocontrol-backend-simple.onrender.com/health

# Test root endpoint
curl https://neurocontrol-backend-simple.onrender.com/
```

### 8.3 Test Backend 2
```bash
# Test health endpoint
curl https://neurocontrol-backend-complex.onrender.com/health
```

### 8.4 Test Frontend-Backend Connection
1. Open your frontend URL
2. Check browser console for API calls
3. Verify data is loading from backends

---

## 🔒 Step 9: Security & Best Practices

### 9.1 Enable HTTPS
- Vercel: Automatic HTTPS
- Render: Automatic HTTPS

### 9.2 Environment Variables Security
- Never commit `.env` files
- Use strong random secrets
- Rotate keys periodically

### 9.3 CORS Configuration
Update CORS origins in both backends:
```python
CORS_ORIGINS=[
    "https://your-frontend.vercel.app",
    "https://www.your-frontend.vercel.app"
]
```

### 9.4 Rate Limiting
Both backends should have rate limiting (already in Backend 2)

---

## 📊 Step 10: Monitoring & Logging

### 10.1 Vercel Monitoring
- Go to Vercel Dashboard → Analytics
- View real-time metrics
- Check deployment logs

### 10.2 Render Monitoring
- Go to Render Dashboard → Logs
- View real-time logs
- Monitor resource usage

### 10.3 Health Checks
Set up automated health checks:
```bash
# Add to cron job or monitoring service
curl https://neurocontrol-backend-simple.onrender.com/health
curl https://neurocontrol-backend-complex.onrender.com/health
```

---

## 🆘 Troubleshooting

### Common Issues

**Frontend Not Connecting to Backend**
```bash
# Check CORS configuration
# Verify backend URLs in environment variables
# Check browser console for CORS errors
```

**Backend Deployment Fails**
```bash
# Check Render logs for errors
# Verify requirements.txt is correct
# Ensure Procfile exists and is correct
# Check Python version in runtime.txt
```

**WebSocket Not Working (Backend 2)**
```bash
# Ensure using eventlet worker class
# Check SOCKETIO_ASYNC_MODE environment variable
# Verify Render supports WebSockets (Free tier has limitations)
```

**Database Connection Issues**
```bash
# Verify DATABASE_URL is correct
# Check database is accessible from Render
# Ensure SSL is enabled for PostgreSQL
```

---

## 📝 Deployment Checklist

### Before Deployment
- [ ] All environment variables documented
- [ ] Procfiles created for both backends
- [ ] .env.example files created
- [ ] Frontend builds successfully locally
- [ ] Backends run successfully locally
- [ ] CORS origins configured
- [ ] Database connections tested

### After Deployment
- [ ] Frontend accessible on Vercel
- [ ] Backend 1 accessible on Render
- [ ] Backend 2 accessible on Render
- [ ] Health endpoints responding
- [ ] Frontend can connect to backends
- [ ] WebSocket connections working (Backend 2)
- [ ] Environment variables configured
- [ ] Monitoring enabled

---

## 🎉 Success Metrics

Your deployment is successful when:

✅ **Frontend**: Loads on Vercel URL  
✅ **Backend 1**: Health endpoint returns 200  
✅ **Backend 2**: Health endpoint returns 200  
✅ **API Calls**: Frontend can fetch data from backends  
✅ **WebSocket**: Real-time updates working (Backend 2)  
✅ **HTTPS**: All services use HTTPS  
✅ **CORS**: No CORS errors in browser  

---

## 📞 Support Links

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Flask Deployment**: https://flask.palletsprojects.com/en/latest/deploying/
- **SocketIO Deployment**: https://python-socketio.readthedocs.io/

---

**🚀 Your NeuroControl AI is now deployed and live!**
