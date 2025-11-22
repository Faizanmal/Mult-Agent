# Testing Guide for Multi-Agent & Multi-Modal System

## Quick Start Testing

### Prerequisites
```bash
cd /workspaces/Mult-Agent/backend

# Run migrations (if Django is installed)
chmod +x setup_modules.sh
./setup_modules.sh

# Or manually:
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

---

## Test 1: Multi-Agent Coordination

### A. Create Coordination Session
```bash
curl -X POST http://localhost:8000/coordination/api/sessions/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Coordination",
    "strategy": "sequential",
    "config": {}
  }'
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "name": "Test Coordination",
  "strategy": "sequential",
  "created_at": "2025-11-22T...",
  "message": "Coordination session created successfully"
}
```

### B. List Coordination Sessions
```bash
curl http://localhost:8000/coordination/api/sessions/
```

### C. Execute Agent Coordination
```bash
# First, get agent IDs from existing agents
curl http://localhost:8000/agents/api/agents/

# Then coordinate them
curl -X POST http://localhost:8000/coordination/api/sessions/{SESSION_ID}/coordinate_agents/ \
  -H "Content-Type: application/json" \
  -d '{
    "agent_ids": ["agent-uuid-1", "agent-uuid-2"],
    "task": "Analyze customer feedback and generate response",
    "strategy": "sequential"
  }'
```

**Expected Response:**
```json
{
  "strategy": "sequential",
  "results": [
    {
      "agent_id": "agent-uuid-1",
      "agent_name": "Vision Agent",
      "agent_type": "vision",
      "output": "Processed by Vision Agent",
      "timestamp": "2025-11-22T..."
    },
    {
      "agent_id": "agent-uuid-2",
      "agent_name": "Reasoning Agent",
      "agent_type": "reasoning",
      "output": "Processed by Reasoning Agent",
      "timestamp": "2025-11-22T..."
    }
  ],
  "status": "completed"
}
```

### D. View Interactions
```bash
curl http://localhost:8000/coordination/api/sessions/{SESSION_ID}/interactions/
```

### E. View Metrics
```bash
curl http://localhost:8000/coordination/api/sessions/{SESSION_ID}/metrics/
```

---

## Test 2: Multi-Modal Intelligence

### A. List AI Models
```bash
curl http://localhost:8000/intelligence/api/models/
```

### B. Create AI Model Configuration
```bash
curl -X POST http://localhost:8000/intelligence/api/models/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPT-4 Vision",
    "model_type": "vision",
    "provider": "openai",
    "model_id": "gpt-4-vision",
    "capabilities": ["image_analysis", "object_detection"],
    "config": {
      "temperature": 0.7
    }
  }'
```

### C. Process Multi-Modal Input (Text Only)
```bash
curl -X POST http://localhost:8000/intelligence/api/intelligence/process_multimodal/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Analyze this customer complaint: The product arrived damaged.",
    "session_name": "Customer Complaint Analysis",
    "processing_options": {
      "analyze_sentiment": true,
      "extract_keywords": true
    }
  }'
```

### D. Process Multi-Modal Input (Text + Image)
```bash
# Create a test image file first
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > test_image.png

# Upload with multipart form data
curl -X POST http://localhost:8000/intelligence/api/intelligence/process_multimodal/ \
  -F "text=What objects are in this image?" \
  -F "image=@test_image.png" \
  -F "session_name=Image Analysis Test" \
  -F 'processing_options={"generate_caption":true,"detect_objects":true}'
```

**Expected Response:**
```json
{
  "session_id": "uuid-here",
  "results": {
    "processing_id": "proc_...",
    "input_types": ["text", "image"],
    "results": {
      "text": {
        "content": "What objects are in this image?",
        "statistics": {...},
        "analysis": {...}
      },
      "image": {
        "format": "PNG",
        "dimensions": {...},
        "analysis": {
          "caption": "Description of image",
          "objects": [...]
        }
      }
    },
    "processing_time": 2.34
  },
  "input_modalities": ["text", "image"],
  "status": "completed"
}
```

### E. List Multi-Modal Sessions
```bash
curl http://localhost:8000/intelligence/api/intelligence/sessions/
```

### F. Get Session Details
```bash
curl http://localhost:8000/intelligence/api/intelligence/{SESSION_ID}/session_detail/
```

### G. Cross-Modal Analysis
```bash
curl -X POST http://localhost:8000/intelligence/api/intelligence/cross_modal_analysis/ \
  -H "Content-Type: application/json" \
  -d '{
    "modality_results": {
      "text": {
        "content": "The sky is blue",
        "sentiment": "positive"
      },
      "image": {
        "objects": ["sky", "clouds"],
        "colors": ["blue", "white"]
      }
    }
  }'
```

---

## Test 3: Workflow with Multi-Modal

### A. List Available Workflows
```bash
curl http://localhost:8000/agents/api/workflows/templates/
```

### B. Execute Workflow
```bash
curl -X POST http://localhost:8000/agents/api/workflows/execute/ \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "data_analysis_pipeline",
    "input_data": {
      "data_source": "customer_feedback.csv",
      "analysis_type": "descriptive"
    }
  }'
```

---

## Test 4: WebSocket Real-Time Communication

### Using JavaScript (Browser Console or Node.js)
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/session/test-session-123/');

ws.onopen = () => {
  console.log('Connected to session');
  
  // Send a message
  ws.send(JSON.stringify({
    type: 'chat_message',
    content: 'Hello, agents!',
    user_id: 'test-user',
    message_type: 'text'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### Using Python
```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/session/test-session-123/"
    
    async with websockets.connect(uri) as websocket:
        # Send message
        await websocket.send(json.dumps({
            "type": "chat_message",
            "content": "Hello from Python!",
            "user_id": "test-user",
            "message_type": "text"
        }))
        
        # Receive response
        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(test_websocket())
```

---

## Test 5: Agent Memory Integration

### A. Store Memory
```python
# Through agent coordinator (internal API)
from agents.services.agent_coordinator import AgentCoordinator
from agents.models import Agent, Session

session = Session.objects.first()
coordinator = AgentCoordinator(session)

# Memory operations happen automatically during task execution
# But you can test directly:
memory_result = coordinator._handle_memory_operations({
    'assigned_agent': Agent.objects.first(),
    'input_data': {
        'operation': 'store',
        'memory_data': {
            'customer_preference': 'prefers email communication',
            'last_interaction': 'complained about delivery'
        },
        'importance': 0.9
    }
})

print(memory_result)
```

### B. Retrieve Memory
```python
memory_result = coordinator._handle_memory_operations({
    'assigned_agent': Agent.objects.first(),
    'input_data': {
        'operation': 'retrieve',
        'query': 'customer preference'
    }
})

print(memory_result['retrieved_items'])
```

---

## Test 6: Complete End-to-End Flow

### Python Integration Test
```python
import requests
import json

BASE_URL = "http://localhost:8000"

# 1. Create coordination session
coord_response = requests.post(
    f"{BASE_URL}/coordination/api/sessions/",
    json={
        "name": "E2E Test Session",
        "strategy": "sequential"
    }
)
session_id = coord_response.json()['id']
print(f"Created session: {session_id}")

# 2. Process multi-modal input
mm_response = requests.post(
    f"{BASE_URL}/intelligence/api/intelligence/process_multimodal/",
    json={
        "text": "Analyze customer satisfaction from this feedback",
        "session_name": "Customer Analysis"
    }
)
mm_session_id = mm_response.json()['session_id']
print(f"Processed multi-modal: {mm_session_id}")

# 3. Execute workflow
workflow_response = requests.post(
    f"{BASE_URL}/agents/api/workflows/execute/",
    json={
        "workflow_id": "customer_support_ticket",
        "input_data": {
            "ticket_content": "Product not working as expected",
            "priority": "high"
        }
    }
)
print(f"Workflow result: {workflow_response.json()}")

# 4. Check coordination metrics
metrics_response = requests.get(
    f"{BASE_URL}/coordination/api/sessions/{session_id}/metrics/"
)
print(f"Metrics: {metrics_response.json()}")
```

---

## Expected Behaviors

### ✅ Success Indicators

1. **Coordination:**
   - Sessions created with unique UUIDs
   - Agents execute in correct order based on strategy
   - Interactions tracked between agents
   - Metrics collected and aggregated

2. **Multi-Modal:**
   - Different modalities processed correctly
   - Cross-modal insights generated
   - Results stored in database
   - Session history maintained

3. **Workflow:**
   - Steps execute based on dependencies
   - Context passed between steps
   - Errors handled with retries
   - Results aggregated properly

4. **Memory:**
   - Memories stored with timestamps
   - Relevant memories retrieved based on query
   - Importance scores affect retrieval
   - Access times updated

---

## Troubleshooting

### Common Issues

1. **404 Not Found**
   ```bash
   # Check URL routing
   python manage.py show_urls
   
   # Verify apps in settings.py
   grep -A 10 "INSTALLED_APPS" backend/settings.py
   ```

2. **Database Errors**
   ```bash
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   
   # Check migration status
   python manage.py showmigrations
   ```

3. **Import Errors**
   ```bash
   # Check module structure
   ls -la Multi_agents_cordination/
   ls -la Multi_model_Intelligence/
   
   # Verify __init__.py exists
   ```

4. **WebSocket Connection Failed**
   ```bash
   # Check ASGI configuration
   cat backend/asgi.py
   
   # Verify channels in settings
   grep -A 5 "CHANNEL_LAYERS" backend/settings.py
   ```

---

## Performance Testing

### Load Test with Apache Bench
```bash
# Test coordination endpoint
ab -n 100 -c 10 -T application/json \
   -p test_data.json \
   http://localhost:8000/coordination/api/sessions/

# Test multi-modal endpoint
ab -n 50 -c 5 \
   http://localhost:8000/intelligence/api/intelligence/sessions/
```

### Monitor Performance
```python
# Check metrics
import requests

response = requests.get('http://localhost:8000/agents/api/analytics/dashboard/')
print(response.json())
```

---

## Automated Testing Script

Save as `test_all.sh`:
```bash
#!/bin/bash

echo "Testing Multi-Agent System..."

# Test 1: Coordination
echo "\n1. Testing Coordination API..."
curl -s -X POST http://localhost:8000/coordination/api/sessions/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Auto Test","strategy":"sequential"}' | jq .

# Test 2: Intelligence
echo "\n2. Testing Intelligence API..."
curl -s http://localhost:8000/intelligence/api/models/ | jq .

# Test 3: Workflow
echo "\n3. Testing Workflow API..."
curl -s http://localhost:8000/agents/api/workflows/templates/ | jq .

echo "\n✅ All tests completed!"
```

Run with:
```bash
chmod +x test_all.sh
./test_all.sh
```

---

## Verification Checklist

- [ ] Coordination sessions can be created
- [ ] Agents coordinate using different strategies
- [ ] Multi-modal inputs are processed
- [ ] Cross-modal insights are generated
- [ ] Workflows execute successfully
- [ ] Agent memory stores and retrieves data
- [ ] WebSocket connections work
- [ ] Metrics are collected
- [ ] Error handling works
- [ ] API responses are correct

---

**Status**: Ready for Testing
**Last Updated**: November 22, 2025
