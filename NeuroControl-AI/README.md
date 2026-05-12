# 🧠 NeuroControl AI - Next-Generation Industrial Control System

**Production-Grade AI-Powered Industrial Monitoring Platform**

Inspired by ABB, Siemens, Honeywell, and Tesla interfaces - built for real industrial deployment.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend    │    │    Backend     │    │   Database     │
│                │    │                │    │                │
│  React + Vite  │◄──►│   Flask API    │◄──►│  Supabase PG   │
│  Tailwind CSS   │    │  Flask-SocketIO│    │  Real-time DB   │
│  shadcn/ui      │    │  JWT Auth      │    │  Row Security  │
│  Framer Motion  │    │  Gemini AI      │    │  Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────┐              │
         └──────────────►│  AI Services  │◄─────────────┘
                        │              │
                        │ Gemini API   │
                        │ Alert Engine │
                        │ Predictions  │
                        └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase Account (Free)
- Gemini API Key

### Installation
```bash
# Clone and setup
git clone <repository>
cd NeuroControl-AI

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Database setup
# Run schema.sql in Supabase SQL Editor
# Configure environment variables
```

---

## 📁 Project Structure

```
NeuroControl-AI/
├── frontend/                    # React Vite Application
│   ├── src/
│   │   ├── components/          # Reusable UI Components
│   │   ├── pages/             # Page Components
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── services/          # API Services
│   │   ├── utils/             # Utility Functions
│   │   └── styles/            # Tailwind Configuration
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                     # Flask API Server
│   ├── app/
│   │   ├── models/            # Database Models
│   │   ├── routes/            # API Routes
│   │   ├── services/          # Business Logic
│   │   ├── middleware/        # Auth & Validation
│   │   └── utils/             # Helper Functions
│   ├── config/
│   ├── requirements.txt
│   └── app.py
├── database/                    # Database Schema
│   ├── schema.sql
│   └── migrations/
├── docs/                       # Documentation
├── deployment/                  # Deployment Configs
└── README.md
```

---

## 🎯 Core Features

### 🔐 Authentication System
- **JWT-based authentication** with secure token management
- **Role-based access control**:
  - **Operator**: Machine monitoring, basic alerts
  - **Supervisor**: Alert management, team oversight
  - **Maintenance Engineer**: Predictive maintenance, repair logs
  - **Plant Manager**: Analytics, KPIs, risk analysis

### 📊 Real-Time Industrial Dashboard
- **Live sensor monitoring**: Temperature, Pressure, Vibration, Voltage, Gas Levels
- **Machine status visualization**: Real-time health indicators
- **System health metrics**: Overall plant efficiency, uptime statistics
- **AI confidence scoring**: Trust indicators for AI predictions

### 🚨 Smart Alert Engine
- **Intelligent prioritization**:
  - **Critical**: Gas leaks, safety breaches, catastrophic failures
  - **High**: Equipment malfunctions, efficiency drops
  - **Medium**: Performance degradation, maintenance needed
  - **Low**: Minor fluctuations, monitoring recommendations

- **AI-powered features**:
  - Duplicate alert merging
  - Alarm fatigue reduction
  - Contextual prioritization
  - Root cause analysis

### 🤖 AI Recommendation Engine
- **Predictive failure analysis**: Machine learning-based predictions
- **Actionable recommendations**: Specific steps for operators
- **Risk assessment**: Probability-based threat evaluation
- **Maintenance scheduling**: Optimized downtime planning

### 💬 AI Chat Assistant
- **Natural language queries**: "Why is machine 4 critical?"
- **Contextual responses**: Based on real-time data
- **Industrial expertise**: Specialized knowledge base
- **Voice interaction**: Hands-free operation support

### 📈 Role-Based Dashboards
- **Operator View**: Machine monitoring, active alerts, quick actions
- **Supervisor View**: Alert management, team performance, escalation
- **Maintenance View**: Predictive maintenance, repair schedules, parts inventory
- **Manager View**: Plant analytics, KPIs, cost analysis, risk reports

### 🔮 Predictive Maintenance
- **Trend analysis**: Historical pattern recognition
- **Threshold monitoring**: Intelligent limit detection
- **Failure scoring**: Probability-based risk assessment
- **Automated scheduling**: AI-optimized maintenance planning

### 🎨 Modern UI/UX
- **Tesla-inspired design**: Clean, futuristic interface
- **Dark theme optimization**: 24/7 operations friendly
- **Glassmorphism effects**: Modern depth and clarity
- **Smooth animations**: Framer Motion micro-interactions
- **Responsive design**: Mobile, tablet, desktop support

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for premium component library
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Flask** for lightweight, fast API
- **Flask-SocketIO** for real-time WebSocket communication
- **JWT** for secure authentication
- **SQLAlchemy** for database ORM
- **Gemini API** for AI capabilities

### Database
- **Supabase PostgreSQL** for managed database
- **Real-time subscriptions** for live updates
- **Row Level Security** for data protection
- **Automatic backups** and point-in-time recovery

### Deployment
- **Vercel** for frontend hosting
- **Render** for backend deployment
- **Supabase** for database hosting

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Render)
```bash
# Deploy to Render with Dockerfile
# Environment variables configured in Render dashboard
```

### Database (Supabase)
1. Create project at supabase.com
2. Run `database/schema.sql`
3. Configure environment variables
4. Enable real-time subscriptions

---

## 🔒 Security Features

- **JWT authentication** with refresh tokens
- **Row Level Security** in database
- **API rate limiting** for protection
- **Input validation** and sanitization
- **HTTPS enforcement** in production
- **Environment variable** protection
- **Audit logging** for compliance

---

## 📊 Monitoring & Analytics

- **Real-time metrics**: System performance, user activity
- **Error tracking**: Comprehensive logging system
- **Performance monitoring**: Response times, database queries
- **User analytics**: Feature usage, navigation patterns
- **System health**: Uptime, resource utilization

---

## 🧪 Testing

- **Frontend**: Jest + React Testing Library
- **Backend**: Pytest with fixtures
- **Integration**: End-to-end API testing
- **Load testing**: Performance under stress
- **Security testing**: Vulnerability scanning

---

## 📱 Mobile Support

- **Responsive design** adapts to all screen sizes
- **Touch-friendly** interface elements
- **PWA capabilities** for native app experience
- **Offline support** for critical functions
- **Push notifications** for urgent alerts

---

## 🔄 Future Enhancements

- **Machine Learning**: Custom model training
- **Computer Vision**: Visual inspection integration
- **Voice Commands**: Advanced speech recognition
- **Digital Twins**: 3D machine visualization
- **Blockchain**: Immutable audit trails
- **Edge Computing**: Local AI processing

---

## 📞 Support

- **Documentation**: Comprehensive guides and API docs
- **Community**: GitHub discussions and issues
- **Updates**: Regular feature releases and patches
- **Enterprise**: Priority support for organizations

---

## 📄 License

MIT License - See LICENSE file for details

---

**🧠 NeuroControl AI - Transforming Industrial Operations with Intelligence**
