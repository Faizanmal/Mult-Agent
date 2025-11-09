# Real-World Multi-Agent Workflow System

## Overview

This enhanced multi-agent system transforms your agents into a **real workflow automation platform** capable of solving complex, real-world problems through intelligent coordination and task delegation.

## 🚀 Key Features

### 1. **Predefined Workflow Templates**
Ready-to-use workflows for common business tasks:
- **Data Analysis Pipeline** - Automated data ingestion, cleaning, analysis, and reporting
- **Customer Support Automation** - Intelligent ticket triage and resolution
- **Code Review Process** - Comprehensive automated code reviews
- **Content Creation** - End-to-end content generation with research and SEO
- **Bug Investigation** - Systematic bug analysis and resolution
- **Research & Summarization** - Deep research with synthesis
- **Document Generation** - Automated technical documentation
- **Automated Testing** - Complete testing suite execution
- **Data Quality Checks** - Comprehensive data validation
- **Onboarding Automation** - Employee onboarding workflows

### 2. **Intelligent Workflow Orchestration**
- **Dependency Management** - Automatic resolution of step dependencies
- **Parallel Execution** - Run independent steps simultaneously for speed
- **Retry Logic** - Automatic retry with exponential backoff
- **Error Handling** - Graceful degradation and fallback strategies
- **Context Passing** - Results flow between steps automatically

### 3. **Agent Specialization**
Agents are automatically selected based on:
- **Agent Type** (Orchestrator, Vision, Reasoning, Action, Memory)
- **Capabilities** - Match required capabilities with agent skills
- **Performance History** - Learn from past executions
- **Workload** - Balance tasks across available agents

### 4. **Real-Time Progress Tracking**
- WebSocket-based progress updates
- Step-by-step execution monitoring
- Performance metrics per step
- Real-time error notifications

## 🎯 Quick Start Guide

### Frontend Usage

#### 1. Access Workflow Dashboard
```tsx
import WorkflowDashboard from '@/components/workflow/WorkflowDashboard';

function App() {
  return <WorkflowDashboard />;
}
```

#### 2. Quick Start Workflows
Use the "Quick Start" tab for common tasks:

```typescript
// Example: Analyze Data
{
  use_case: "analyze_data",
  input: "path/to/data.csv"
}

// Example: Handle Support Ticket
{
  use_case: "support_ticket",
  input: "Customer can't login to their account"
}

// Example: Research Topic
{
  use_case: "research",
  input: "What are the latest trends in AI?"
}
```

### Backend API Usage

#### 1. List Available Workflows
```bash
GET /api/agents/api/workflows/templates/
```

Response:
```json
{
  "count": 10,
  "templates": [
    {
      "id": "data_analysis_pipeline",
      "name": "Data Analysis Pipeline",
      "description": "Automated data analysis with visualization",
      "category": "data_analysis",
      "step_count": 6
    }
  ]
}
```

#### 2. Execute a Workflow (Synchronous)
```bash
POST /api/agents/api/workflows/execute/
Content-Type: application/json

{
  "workflow_id": "data_analysis_pipeline",
  "input_data": {
    "data_source": "sales_data.csv",
    "analysis_type": "descriptive",
    "output_format": "report"
  },
  "session_id": "optional-session-uuid"
}
```

Response:
```json
{
  "workflow_id": "data_analysis_pipeline_1699564800",
  "workflow_name": "Data Analysis Pipeline",
  "status": "completed",
  "success": true,
  "execution_time": 45.3,
  "steps_completed": 6,
  "steps_failed": 0,
  "total_steps": 6,
  "results": {
    "step_1_data_ingestion.raw_data": {...},
    "step_6_report_generation.final_report": {...}
  },
  "step_details": [...]
}
```

#### 3. Execute a Workflow (Asynchronous)
```bash
POST /api/agents/api/workflows/execute_async/
Content-Type: application/json

{
  "workflow_id": "code_review_process",
  "input_data": {
    "repository": "https://github.com/user/repo",
    "branch": "feature-branch"
  }
}
```

Response:
```json
{
  "execution_id": "code_review_process_1699564800",
  "status": "started",
  "message": "Workflow execution started in background"
}
```

#### 4. Check Workflow Status
```bash
GET /api/agents/api/workflows/{execution_id}/status/
```

#### 5. Quick Start API
```bash
POST /api/agents/api/workflows/quick_start/
Content-Type: application/json

{
  "use_case": "analyze_data",
  "input": "Analyze Q4 sales trends from sales_2024.csv"
}
```

## 📚 Available Workflows

### Data Analysis Pipeline
**ID**: `data_analysis_pipeline`

**Steps**:
1. Data Ingestion - Load and validate data
2. Data Cleaning - Handle missing values, duplicates
3. Exploratory Analysis - Statistics and correlations
4. Visualization - Create charts and graphs
5. Insight Generation - AI-powered insights
6. Report Generation - Comprehensive report

**Input**:
```json
{
  "data_source": "file.csv",
  "analysis_type": "descriptive",
  "output_format": "report"
}
```

### Customer Support Ticket
**ID**: `customer_support_ticket`

**Steps**:
1. Ticket Analysis - Classify and extract entities
2. History Lookup - Check customer context
3. Knowledge Search - Find relevant solutions
4. Solution Generation - Formulate response
5. Response Crafting - Create customer message
6. Escalation Check - Determine if escalation needed

**Input**:
```json
{
  "ticket_id": "TICK-001",
  "customer_message": "I can't access my account",
  "customer_id": "CUST-123",
  "priority": "high"
}
```

### Code Review Process
**ID**: `code_review_process`

**Steps**:
1. Code Analysis - Syntax, style, complexity
2. Security Scan - Vulnerabilities and secrets
3. Test Execution - Run test suite
4. Best Practices - Design patterns check
5. Documentation Check - Verify docs
6. Review Summary - Compile results

**Input**:
```json
{
  "repository": "https://github.com/user/repo",
  "branch": "feature-branch",
  "files_changed": ["src/main.py"],
  "pr_description": "Added new feature"
}
```

### Content Creation Workflow
**ID**: `content_creation_workflow`

**Steps**:
1. Topic Research - Gather information
2. Outline Generation - Structure content
3. Content Writing - Generate draft
4. Fact Checking - Verify accuracy
5. Visual Creation - Generate images
6. SEO Optimization - Optimize for search
7. Final Polish - Review and edit

**Input**:
```json
{
  "topic": "The Future of AI",
  "content_type": "blog",
  "target_audience": "professionals",
  "length": "medium",
  "tone": "professional"
}
```

### Bug Investigation
**ID**: `bug_investigation`

**Steps**:
1. Log Analysis - Parse error logs
2. Reproduce Bug - Attempt reproduction
3. Root Cause Analysis - Find underlying cause
4. Solution Design - Plan the fix
5. Implement Fix - Write code and tests
6. Verification - Validate the fix
7. Documentation - Document resolution

**Input**:
```json
{
  "bug_description": "Application crashes on login",
  "error_logs": "...",
  "steps_to_reproduce": ["Open app", "Click login"],
  "affected_systems": ["authentication"]
}
```

## 🏗️ Architecture

### Workflow Execution Flow

```
1. User initiates workflow
   ↓
2. Load workflow template
   ↓
3. Create workflow execution context
   ↓
4. Build dependency graph
   ↓
5. For each execution level:
   ├── Identify ready steps (dependencies met)
   ├── Execute steps in parallel
   ├── Wait for completion
   ├── Store results
   └── Update progress
   ↓
6. Compile final results
   ↓
7. Return response to user
```

### Component Structure

```
backend/agents/services/
├── workflow_templates.py      # Predefined workflow definitions
├── workflow_orchestrator.py   # Execution engine
├── agent_coordinator.py       # Agent coordination
└── groq_service.py           # AI integration

backend/agents/
├── workflow_views.py         # REST API endpoints
└── models.py                 # Data models

frontend/src/components/workflow/
└── WorkflowDashboard.tsx     # UI component
```

## 🔧 Configuration

### Creating Custom Workflows

1. **Define Workflow Template** in `workflow_templates.py`:

```python
@staticmethod
def my_custom_workflow() -> Dict:
    return {
        'id': 'my_workflow',
        'name': 'My Custom Workflow',
        'description': 'Does something useful',
        'category': WorkflowCategory.AUTOMATION.value,
        'input_schema': {
            'input_param': 'string',
        },
        'steps': [
            {
                'id': 'step_1',
                'name': 'First Step',
                'type': 'agent_task',
                'agent_type': 'action',
                'config': {
                    'task': 'do_something',
                    'capabilities_required': ['capability1'],
                },
                'dependencies': [],
                'outputs': ['result1'],
            },
            # Add more steps...
        ],
        'error_handling': {
            'retry_failed_steps': True,
            'max_retries': 3,
        },
        'success_criteria': {
            'minimum_steps_completed': 1,
            'required_outputs': ['result1'],
        },
    }
```

2. **Register in `get_all_templates()`**:

```python
def get_all_templates() -> Dict[str, Dict]:
    return {
        'my_workflow': WorkflowTemplates.my_custom_workflow(),
        # ... other workflows
    }
```

### Configuring Agent Capabilities

Update your agents with relevant capabilities:

```python
agent = Agent.objects.create(
    name="Data Analyst Agent",
    type="reasoning",
    capabilities=[
        'data_analysis',
        'statistical_analysis',
        'visualization',
        'pattern_recognition',
    ],
    configuration={
        'model': 'llama3-70b-8192',  # Use more powerful model
        'temperature': 0.3,           # Lower for analytical tasks
    }
)
```

## 📊 Real-World Use Cases

### 1. Daily Data Report Automation
```python
# Schedule daily execution
workflow_id = "data_analysis_pipeline"
input_data = {
    "data_source": "daily_metrics.csv",
    "analysis_type": "descriptive",
    "output_format": "report"
}
# Execute at 9 AM daily
```

### 2. Customer Support Triage
```python
# Process incoming tickets
for ticket in new_tickets:
    result = orchestrator.execute_workflow(
        workflow_id="customer_support_ticket",
        input_data={
            "ticket_id": ticket.id,
            "customer_message": ticket.message,
            "priority": ticket.priority
        }
    )
    # Automatically respond or escalate
```

### 3. CI/CD Integration
```python
# On pull request
result = orchestrator.execute_workflow(
    workflow_id="code_review_process",
    input_data={
        "repository": pr.repo_url,
        "branch": pr.branch,
        "files_changed": pr.changed_files
    }
)
# Post results as PR comment
```

### 4. Content Pipeline
```python
# Generate content schedule
for topic in content_calendar:
    orchestrator.execute_workflow(
        workflow_id="content_creation_workflow",
        input_data={
            "topic": topic.title,
            "content_type": "blog",
            "length": "long"
        }
    )
```

## 🎓 Best Practices

1. **Start Simple**: Use Quick Start for common tasks
2. **Monitor Progress**: Watch step execution in real-time
3. **Handle Errors**: Configure appropriate retry strategies
4. **Optimize Agents**: Assign capabilities that match workflow needs
5. **Parallel Execution**: Design workflows with parallelizable steps
6. **Result Caching**: Store intermediate results for efficiency
7. **Logging**: Review step details to improve workflows

## 🔍 Troubleshooting

### Workflow Fails Immediately
- Check input data matches template schema
- Verify agents exist for required types
- Review error message in response

### Step Hangs or Times Out
- Check agent configuration and model availability
- Verify Groq API credentials
- Review timeout settings in step config

### No Agents Available
- Create agents with required types:
  ```python
  for agent_type in ['orchestrator', 'reasoning', 'action', 'vision', 'memory']:
      Agent.objects.create(
          name=f"{agent_type.title()} Agent",
          type=agent_type,
          owner=user,
          capabilities=[]
      )
  ```

## 🚀 Future Enhancements

- [ ] Workflow versioning
- [ ] A/B testing for workflows
- [ ] Workflow marketplace
- [ ] Visual workflow builder
- [ ] Integration with external APIs
- [ ] Scheduled workflow execution
- [ ] Workflow templates from natural language
- [ ] Multi-tenant workflow sharing

## 📝 API Reference

See the complete API documentation at:
- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`

## 💡 Examples

Check the `/examples` directory for:
- Python scripts for workflow execution
- Integration examples
- Custom workflow templates
- Testing workflows

---

**Built with**: Django REST Framework, React, TypeScript, Groq AI

**License**: MIT
