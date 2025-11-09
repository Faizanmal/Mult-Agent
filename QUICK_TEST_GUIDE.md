# Quick Start Guide - Test Your Workflow System

## 🚀 5-Minute Quick Test

### Step 1: Start the Backend Server (if not running)
```bash
cd /workspaces/Mult-Agent/backend
python manage.py runserver
```

### Step 2: Test the API Directly

#### Test 1: List Available Workflows
```bash
curl http://localhost:8000/api/agents/api/workflows/templates/ | jq
```

Expected: JSON response with 10 workflow templates

#### Test 2: Get Template Details
```bash
curl http://localhost:8000/api/agents/api/workflows/data_analysis_pipeline/template_detail/ | jq
```

#### Test 3: Quick Start - Research
```bash
curl -X POST http://localhost:8000/api/agents/api/workflows/quick_start/ \
  -H "Content-Type: application/json" \
  -d '{
    "use_case": "research",
    "input": "What are the benefits of multi-agent systems?"
  }' | jq
```

#### Test 4: Execute Full Workflow
```bash
curl -X POST http://localhost:8000/api/agents/api/workflows/execute/ \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "data_analysis_pipeline",
    "input_data": {
      "data_source": "sample_data.csv",
      "analysis_type": "descriptive",
      "output_format": "report"
    }
  }' | jq
```

### Step 3: Test with Python Script

```bash
cd /workspaces/Mult-Agent
python examples/workflow_examples.py
```

This will run all 7 examples and show you the workflows in action!

### Step 4: Test the Frontend

1. Start frontend (if not running):
```bash
cd /workspaces/Mult-Agent/frontend
npm run dev
```

2. Open browser: `http://localhost:3000`

3. Navigate to Workflow Dashboard (you may need to add it to your navigation)

4. Try the Quick Start workflows!

## 🔍 Verify Installation

Run this checklist:

```bash
# Check workflow templates file exists
[ -f /workspaces/Mult-Agent/backend/agents/services/workflow_templates.py ] && echo "✅ Templates" || echo "❌ Templates missing"

# Check orchestrator exists
[ -f /workspaces/Mult-Agent/backend/agents/services/workflow_orchestrator.py ] && echo "✅ Orchestrator" || echo "❌ Orchestrator missing"

# Check API views exist
[ -f /workspaces/Mult-Agent/backend/agents/workflow_views.py ] && echo "✅ API Views" || echo "❌ API Views missing"

# Check frontend component exists
[ -f /workspaces/Mult-Agent/frontend/src/components/workflow/WorkflowDashboard.tsx ] && echo "✅ Frontend UI" || echo "❌ Frontend UI missing"

# Check examples exist
[ -f /workspaces/Mult-Agent/examples/workflow_examples.py ] && echo "✅ Examples" || echo "❌ Examples missing"

# Check documentation exists
[ -f /workspaces/Mult-Agent/WORKFLOW_GUIDE.md ] && echo "✅ Documentation" || echo "❌ Documentation missing"
```

## 🐛 Troubleshooting Quick Fixes

### Issue: "Module not found: workflow_views"
```bash
cd /workspaces/Mult-Agent/backend
# Check if file exists
ls -l agents/workflow_views.py
# Restart server
python manage.py runserver
```

### Issue: "No agents available"
Create default agents:
```python
python manage.py shell

from agents.models import Agent
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Create agents for each type
for agent_type in ['orchestrator', 'reasoning', 'action', 'vision', 'memory']:
    Agent.objects.get_or_create(
        name=f"{agent_type.title()} Agent",
        type=agent_type,
        owner=user,
        defaults={
            'capabilities': ['general'],
            'configuration': {'model': 'llama3-8b-8192'}
        }
    )

print("✅ Agents created!")
```

### Issue: "Workflow execution fails"
Check Groq API key:
```bash
# In backend/.env
GROQ_API_KEY=your_api_key_here
```

## 📝 Minimal Working Example

Save this as `test_workflow.py`:

```python
import requests
import json

# Test the workflow system
def test_workflow():
    # 1. List templates
    print("1. Fetching templates...")
    response = requests.get('http://localhost:8000/api/agents/api/workflows/templates/')
    templates = response.json()
    print(f"   Found {templates['count']} templates ✅")
    
    # 2. Execute quick start
    print("\n2. Executing quick start workflow...")
    response = requests.post(
        'http://localhost:8000/api/agents/api/workflows/quick_start/',
        json={
            'use_case': 'research',
            'input': 'What is multi-agent coordination?'
        }
    )
    result = response.json()
    print(f"   Workflow: {result['result']['workflow_name']}")
    print(f"   Status: {result['result']['status']} ✅")
    print(f"   Time: {result['result']['execution_time']:.2f}s")
    print(f"   Steps: {result['result']['steps_completed']}/{result['result']['total_steps']}")
    
    print("\n✅ Workflow system is working!")
    return True

if __name__ == "__main__":
    try:
        test_workflow()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. Backend server is running (python manage.py runserver)")
        print("2. Agents are created (see troubleshooting above)")
        print("3. Groq API key is configured")
```

Run it:
```bash
python test_workflow.py
```

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Templates endpoint returns 10 workflows
2. ✅ Quick start executes without errors
3. ✅ Step details show completed status
4. ✅ Results contain output data
5. ✅ Frontend dashboard displays workflows
6. ✅ Example script runs all tests

## 🎯 Next Steps After Testing

Once verified working:

1. **Customize Workflows**: Edit `workflow_templates.py` to add your workflows
2. **Configure Agents**: Set up agents with specific capabilities
3. **Integrate**: Connect to your existing systems
4. **Monitor**: Watch execution logs and performance
5. **Scale**: Deploy with proper infrastructure

## 📚 Reference Quick Links

- **Full Guide**: `WORKFLOW_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Python Examples**: `examples/workflow_examples.py`
- **API Docs**: `http://localhost:8000/api/schema/swagger-ui/`

## 💡 Quick Tips

1. **Start Simple**: Use quick start first
2. **Check Logs**: Watch server output for errors
3. **Test Incrementally**: One workflow at a time
4. **Use Examples**: Run provided Python scripts
5. **Read Errors**: Error messages guide fixes

---

**You're ready to automate! 🚀**

Your multi-agent system can now handle real-world workflows automatically.
