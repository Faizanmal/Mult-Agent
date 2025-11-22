# 🚀 Deployment & Setup Guide

## Complete Setup Instructions for Multi-Agent System

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- Redis (for Django Channels)
- Git

---

## 📦 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd /workspaces/Mult-Agent/backend
```

### 2. Create Python Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create `.env` file in `backend/` directory:

```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=multiagent_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Redis (for Django Channels)
REDIS_URL=redis://localhost:6379/0

# AI Services
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-key  # Optional

# CORS (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 5. Database Setup

#### Option A: Using PostgreSQL Directly
```bash
# Create database
createdb multiagent_db

# Or using psql
psql -U postgres
CREATE DATABASE multiagent_db;
\q
```

#### Option B: Using Docker
```bash
docker run -d \
  --name multiagent-postgres \
  -e POSTGRES_DB=multiagent_db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:14
```

### 6. Run Migrations

Use the automated script:
```bash
chmod +x setup_modules.sh
./setup_modules.sh
```

Or manually:
```bash
# Create migrations for new modules
python manage.py makemigrations agents
python manage.py makemigrations Multi_agents_cordination
python manage.py makemigrations Multi_model_Intelligence
python manage.py makemigrations authentication
python manage.py makemigrations notifications

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 7. Start Redis (for WebSocket support)

#### Option A: System Installation
```bash
redis-server
```

#### Option B: Docker
```bash
docker run -d \
  --name multiagent-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### 8. Start Django Development Server
```bash
python manage.py runserver 0.0.0.0:8000
```

#### Or with Daphne (for WebSocket support):
```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

### 9. Verify Backend

Test endpoints:
```bash
# Health check
curl http://localhost:8000/health/

# API endpoints
curl http://localhost:8000/agents/api/agents/
curl http://localhost:8000/coordination/api/sessions/
curl http://localhost:8000/intelligence/api/models/
```

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd /workspaces/Mult-Agent/frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create `.env.local` file in `frontend/` directory:

```bash
# Backend API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Verify Frontend

Open browser:
- Main app: http://localhost:3000
- Coordination: http://localhost:3000/coordination
- Intelligence: http://localhost:3000/intelligence

---

## 🐳 Docker Deployment (Recommended for Production)

### 1. Build and Start All Services

```bash
# From project root
docker-compose up -d --build
```

This starts:
- PostgreSQL database
- Redis cache
- Django backend (with Daphne)
- Next.js frontend

### 2. Run Migrations in Docker
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 3. Access Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin: http://localhost:8000/admin
- Database: localhost:5432

### 4. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Stop Services
```bash
docker-compose down

# With data cleanup
docker-compose down -v
```

---

## 🧪 Testing the Integration

### 1. Backend Tests
```bash
cd backend
python manage.py test

# Specific app
python manage.py test agents
python manage.py test Multi_agents_cordination
python manage.py test Multi_model_Intelligence
```

### 2. Frontend Tests
```bash
cd frontend
npm test

# E2E tests (if configured)
npm run test:e2e
```

### 3. Manual Integration Testing

#### Test Coordination:
```bash
# Create session
curl -X POST http://localhost:8000/coordination/api/sessions/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Session",
    "strategy": "parallel"
  }'

# Coordinate agents
curl -X POST http://localhost:8000/coordination/api/sessions/1/coordinate_agents/ \
  -H "Content-Type: application/json" \
  -d '{
    "agent_ids": ["agent-1", "agent-2"],
    "task": "Analyze customer feedback"
  }'
```

#### Test Multi-Modal:
```bash
# Process multi-modal
curl -X POST http://localhost:8000/intelligence/api/intelligence/process_multimodal/ \
  -F "text=Analyze this image" \
  -F "image=@/path/to/image.jpg"
```

---

## 📊 Database Initialization

### Load Initial Data

```bash
cd backend

# Load sample agents
python manage.py loaddata fixtures/agents.json

# Load AI models
python manage.py loaddata fixtures/ai_models.json
```

### Create Sample Data Script

```bash
python manage.py shell

# In Django shell:
from agents.models import Agent
from Multi_model_Intelligence.models import AIModelConfig

# Create sample agents
Agent.objects.create(
    name="Customer Support Agent",
    agent_type="reasoning",
    description="Handles customer inquiries"
)

# Create AI models
AIModelConfig.objects.create(
    name="GPT-4",
    provider="openai",
    model_type="text",
    endpoint="https://api.openai.com/v1/chat/completions"
)
```

---

## 🔧 Troubleshooting

### Backend Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env
psql -U postgres -d multiagent_db
```

#### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

#### Migration Errors
```bash
# Reset migrations (CAUTION: loses data)
python manage.py migrate --fake agents zero
python manage.py migrate agents

# Or reset database completely
python manage.py flush
python manage.py migrate
```

### Frontend Issues

#### API Connection Error
```bash
# Verify backend is running
curl http://localhost:8000/health/

# Check .env.local has correct URLs
cat .env.local
```

#### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 🚀 Production Deployment

### Backend (Django)

#### 1. Update Settings
```python
# backend/backend/settings.py
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

#### 2. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

#### 3. Use Production Server (Gunicorn + Daphne)
```bash
# Install
pip install gunicorn

# For HTTP
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4

# For WebSocket (use Daphne)
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

#### 4. Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;  # Next.js
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;  # Django
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Frontend (Next.js)

#### 1. Build Production Bundle
```bash
npm run build
```

#### 2. Start Production Server
```bash
npm start
```

#### 3. Or Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📋 Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Superuser account created
- [ ] Environment variables configured
- [ ] Redis running (for WebSocket)
- [ ] Backend responding on port 8000
- [ ] Frontend responding on port 3000
- [ ] CORS configured correctly
- [ ] API endpoints accessible
- [ ] WebSocket connections working
- [ ] Static files served
- [ ] SSL certificates installed (production)
- [ ] Backup strategy in place
- [ ] Monitoring tools configured

---

## 📚 Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **Django Channels**: https://channels.readthedocs.io/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 🎯 Quick Start Commands

### Development (Local)
```bash
# Terminal 1: Backend
cd backend && python manage.py runserver

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Redis
redis-server
```

### Production (Docker)
```bash
# Start everything
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

**Status:** ✅ Ready for deployment!

For issues or questions, check the troubleshooting section or refer to the documentation files:
- `IMPLEMENTATION_SUMMARY.md` - Backend details
- `FRONTEND_IMPLEMENTATION.md` - Frontend details
- `TESTING_GUIDE.md` - Testing instructions
