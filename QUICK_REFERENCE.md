# Quick Reference Guide

## 🚀 Getting Started

### First Time Setup
```bash
# Windows
quick_start.bat

# Manual setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Daily Development
```bash
# Start backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Start frontend (separate terminal)
cd frontend
npm run dev
```

---

## 🧪 Testing

### Run All Tests
```bash
cd backend
python run_tests.py
```

### Run Specific Tests
```bash
pytest agents/tests/test_models.py -v
pytest agents/tests/test_api.py::TestClass::test_method -v
pytest -m unit  # Run only unit tests
pytest -m integration  # Run only integration tests
```

### Check Coverage
```bash
pytest --cov=agents --cov-report=html
# Open htmlcov/index.html
```

---

## 🏥 Health Checks

### Endpoints
```bash
# Basic health
curl http://localhost:8000/health/

# Detailed status
curl http://localhost:8000/health/status/

# Performance metrics
curl http://localhost:8000/health/metrics/

# Kubernetes probes
curl http://localhost:8000/health/ready/
curl http://localhost:8000/health/live/
```

---

## 📝 API Endpoints

### Agents
```bash
GET    /agents/api/agents/           # List agents
POST   /agents/api/agents/           # Create agent
GET    /agents/api/agents/{id}/      # Get agent
PUT    /agents/api/agents/{id}/      # Update agent
DELETE /agents/api/agents/{id}/      # Delete agent
```

### Sessions
```bash
GET    /agents/api/sessions/         # List sessions
POST   /agents/api/sessions/         # Create session
GET    /agents/api/sessions/{id}/    # Get session
POST   /agents/api/sessions/{id}/send_message/  # Send message
```

### Tasks
```bash
GET    /agents/api/tasks/            # List tasks
POST   /agents/api/tasks/            # Create task
GET    /agents/api/tasks/{id}/       # Get task
```

---

## 🔌 WebSocket

### Connect
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/agents/session/{session_id}/');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Send Message
```javascript
ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello, agent!'
}));
```

### Ping/Pong
```javascript
// Send ping
ws.send(JSON.stringify({ type: 'ping' }));

// Receive pong
// { type: 'pong', timestamp: '...' }
```

---

## 💾 Caching

### Use Cache Decorator
```python
from agents.cache_utils import cache_response

@cache_response(timeout=300, key_prefix='my_func')
def my_expensive_function():
    # ... expensive operation
    return result
```

### Manual Caching
```python
from agents.cache_utils import CacheManager

# Cache agent
CacheManager.cache_agent(agent_id, agent_data)

# Get cached agent
agent = CacheManager.get_cached_agent(agent_id)

# Invalidate cache
CacheManager.invalidate_agent(agent_id)
```

### Groq Response Caching
```python
from agents.cache_utils import GroqCacheManager

# Check cache first
cached = GroqCacheManager.get_cached_groq_response(messages, model)
if cached:
    return cached

# Make API call and cache
response = groq_service.chat_completion(messages, model)
GroqCacheManager.cache_groq_response(messages, model, response)
```

---

## 📊 Monitoring

### View Logs
```bash
# Backend logs
tail -f backend/debug.log

# Django logs
python manage.py runserver  # Logs to console
```

### Check System Status
```bash
curl http://localhost:8000/health/status/ | python -m json.tool
```

### Performance Metrics
```bash
curl http://localhost:8000/health/metrics/ | python -m json.tool
```

---

## 🐳 Docker

### Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start specific service
docker-compose -f docker-compose.dev.yml up backend

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop all
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Database

### Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Rollback migration
python manage.py migrate app_name migration_name
```

### Database Shell
```bash
python manage.py dbshell
```

### Django Shell
```bash
python manage.py shell

# In shell
from agents.models import Agent, Session
agents = Agent.objects.all()
```

---

## 🔐 Authentication

### Create Superuser
```bash
python manage.py createsuperuser
```

### Access Admin Panel
```
http://localhost:8000/admin
```

### API Authentication
```bash
# Get token (if using token auth)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token
curl http://localhost:8000/agents/api/agents/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Debugging

### Enable Debug Mode
```python
# backend/backend/settings.py
DEBUG = True
```

### View SQL Queries
```python
from django.db import connection
print(connection.queries)
```

### Debug WebSocket
```javascript
// Browser console
ws.onmessage = (e) => console.log('WS:', e.data);
ws.onerror = (e) => console.error('WS Error:', e);
```

---

## 📦 Dependencies

### Update Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### Add New Dependency
```bash
# Backend
pip install package_name
pip freeze > requirements.txt

# Frontend
npm install package_name
```

---

## 🔥 Common Issues

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Database Locked
```bash
# Stop all Django processes
# Delete db.sqlite3
# Run migrations again
python manage.py migrate
```

### Cache Not Working
```bash
# Check Redis
redis-cli ping

# Clear cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### WebSocket Connection Failed
1. Check CORS settings
2. Verify WebSocket URL (ws:// not http://)
3. Check backend logs
4. Test with simple WebSocket client

---

## 📚 Useful Commands

### Code Quality
```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

### Performance
```bash
# Profile code
python -m cProfile manage.py runserver

# Load testing
locust -f tests/load_test.py
```

### Cleanup
```bash
# Remove Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Remove migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
```

---

## 🎯 Quick Tips

1. **Always activate virtual environment** before running Python commands
2. **Run migrations** after pulling new code
3. **Check health endpoint** to verify system status
4. **Use caching** for expensive operations
5. **Write tests** for new features
6. **Check logs** when debugging
7. **Use Docker** for consistent environment
8. **Monitor performance** with health endpoints

---

## 📞 Getting Help

### Check Logs
```bash
tail -f backend/debug.log
```

### Test Endpoints
```bash
curl -v http://localhost:8000/health/
```

### Django Debug Toolbar
Add to `INSTALLED_APPS` for detailed debugging

### Community
- GitHub Issues
- Stack Overflow
- Django Documentation

---

## 🎉 Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Health check returns "healthy"
- [ ] Tests passing
- [ ] WebSocket connecting
- [ ] Cache working
- [ ] Logs showing activity

**Happy Coding! 🚀**
