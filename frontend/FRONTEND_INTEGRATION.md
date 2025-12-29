# Frontend Integration Guide

## Overview
The frontend is built with Next.js 15+ and TypeScript, providing a modern, type-safe interface for the Multi-Agent System.

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── FeedbackWidget.tsx
│   │   ├── ModelSettings.tsx
│   │   └── AuthForm.tsx
│   ├── hooks/        # Custom React hooks
│   │   ├── useMultiModel.ts    # Multi-model AI API
│   │   ├── useFeedback.ts      # Feedback system
│   │   ├── useAnalytics.ts     # Analytics dashboard
│   │   ├── useAuth.ts          # Authentication
│   │   └── useWebSocket.ts     # Real-time WebSocket
│   └── lib/          # Utility functions
```

## Features

### 1. Authentication (`useAuth` hook)
- **Login/Register**: JWT-based authentication
- **Token Management**: Automatic token refresh
- **Session Handling**: Secure localStorage token storage

```typescript
const { login, register, logout, isAuthenticated } = useAuth();

// Login
await login({ username: 'user', password: 'pass' });

// Register
await register({ username: 'user', email: 'email@test.com', password: 'pass' });
```

### 2. Multi-Model AI (`useMultiModel` hook)
- **Chat Interface**: Send messages to multi-provider AI models
- **Model Preferences**: Configure priority (cost/balanced/quality)
- **Provider Selection**: Auto-select or prefer specific providers (Groq, OpenAI, Anthropic)
- **Performance Metrics**: View execution time and cost per provider

```typescript
const { chat, getPreferences, updatePreferences, getModels, getPerformance } = useMultiModel();

// Send chat message
const response = await chat([
  { role: 'user', content: 'Hello!' }
], agentId);

// Update preferences
await updatePreferences({
  priority: 'balanced',
  preferred_provider: 'groq',
  max_cost_per_request: 0.5,
  fallback_enabled: true
});
```

### 3. Feedback System (`useFeedback` hook)
- **Star Ratings**: 1-5 star ratings for messages
- **Thumbs Up/Down**: Quick binary feedback
- **Comments**: Detailed text feedback
- **Agent Insights**: Sentiment analysis and performance tracking

```typescript
const { quickRating, thumbs, submitFeedback, getAgentInsights } = useFeedback();

// Quick rating
await quickRating(messageId, 5);

// Thumbs feedback
await thumbs(messageId, true);

// Detailed feedback
await submitFeedback({
  feedback_type: 'text',
  comment: 'Great response!',
  message_id: messageId,
  agent_id: agentId
});
```

### 4. Analytics Dashboard (`useAnalytics` hook)
- **Dashboard Overview**: Total agents, sessions, messages, success rates
- **System Health**: Service status (Redis, CosmosDB, Database)
- **Usage Trends**: Historical data with customizable date ranges
- **Model Usage**: Per-provider/model breakdown
- **Performance Metrics**: P95 latency, cache hit rates

```typescript
const { getDashboard, getSystemHealth, getUsageTrends } = useAnalytics();

// Get dashboard data
const dashboard = await getDashboard();
console.log(dashboard.agents.total, dashboard.sessions.active);

// Check system health
const health = await getSystemHealth();
console.log(health.status); // 'healthy' | 'degraded' | 'down'
```

### 5. Real-Time WebSocket (`useWebSocket` hook)
- **Presence Tracking**: See which agents are online
- **Live Messages**: Receive real-time agent messages
- **Status Updates**: Agent status changes (online/offline/busy)
- **Auto-Reconnect**: Automatic reconnection with exponential backoff

```typescript
const { isConnected, presence, messages, sendMessage } = useWebSocket(sessionId);

// Send message via WebSocket
sendMessage('chat_message', {
  content: 'Hello',
  agent_id: agentId
});

// Check presence
Object.values(presence).forEach(agent => {
  console.log(`${agent.agent_id}: ${agent.status}`);
});
```

## Components

### AnalyticsDashboard
Full analytics dashboard with metrics cards and system health indicators.

```tsx
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

<AnalyticsDashboard />
```

### ChatInterface
Complete chat UI with message history, WebSocket support, and feedback widgets.

```tsx
import { ChatInterface } from '@/components/ChatInterface';

<ChatInterface sessionId={sessionId} agentId={agentId} />
```

### FeedbackWidget
Inline feedback widget for messages (star ratings, thumbs, comments).

```tsx
import { FeedbackWidget } from '@/components/FeedbackWidget';

<FeedbackWidget messageId={messageId} agentId={agentId} sessionId={sessionId} />
```

### ModelSettings
Configure multi-model preferences (priority, provider, cost limits).

```tsx
import { ModelSettings } from '@/components/ModelSettings';

<ModelSettings />
```

### AuthForm
Login and registration forms with validation.

```tsx
import { AuthForm } from '@/components/AuthForm';

<AuthForm />
```

## Environment Variables

Create `.env.local` in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional: Frontend URL for password reset emails
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

All endpoints use `/api/` prefix for frontend consumption:

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - User logout

### Multi-Model AI
- `POST /api/multimodel/chat/` - Send chat message
- `GET /api/multimodel/preferences/` - Get user preferences
- `PUT /api/multimodel/preferences/` - Update preferences
- `GET /api/multimodel/models/` - List available models
- `GET /api/multimodel/performance/` - Get performance metrics

### Feedback
- `POST /api/feedback/feedback/` - Submit detailed feedback
- `POST /api/feedback/quick_rating/` - Quick star rating
- `POST /api/feedback/thumbs/` - Thumbs up/down
- `GET /api/feedback/ratings/agent_insights/` - Get agent insights

### Analytics
- `GET /api/reporting/dashboard/` - Dashboard overview
- `GET /api/reporting/system_health/` - System health status
- `GET /api/reporting/usage_trends/?days=30` - Usage trends
- `GET /api/reporting/model_usage/` - Model usage breakdown
- `GET /api/reporting/performance/` - Performance metrics

### WebSocket
- `ws://localhost:8000/ws/agents/{sessionId}/?token={jwt_token}` - Real-time connection

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## TypeScript

All hooks and components are fully typed with TypeScript interfaces:

- `ModelPreference` - Multi-model preferences
- `ChatMessage` - Chat message structure
- `FeedbackData` - Feedback submission data
- `DashboardData` - Analytics dashboard data
- `SystemHealth` - System health status
- `WebSocketMessage` - WebSocket message format

## Authentication Flow

1. User registers/logs in via `AuthForm`
2. JWT tokens (access + refresh) stored in localStorage
3. All API requests include `Authorization: Bearer {token}` header
4. Auto-refresh token on 401 response
5. WebSocket connections include token in URL

## Error Handling

All hooks include:
- `loading` state - Track request status
- `error` state - Capture error messages
- Toast notifications - User-friendly error messages
- Retry logic - Automatic retry for transient failures

## Best Practices

1. **Use hooks in components**: Import and use hooks in React components
2. **Handle loading states**: Show loading indicators during API calls
3. **Error boundaries**: Wrap components in error boundaries
4. **Token refresh**: Automatically handled by hooks
5. **WebSocket cleanup**: Hooks handle connection cleanup on unmount

## Example Usage

```tsx
'use client';

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { isAuthenticated, getUser } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, [isAuthenticated, getUser]);

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="col-span-1">
        <AnalyticsDashboard />
      </div>
      <div className="col-span-1">
        <ChatInterface sessionId={user.id} />
      </div>
    </div>
  );
}
```

## Troubleshooting

### CORS Issues
Ensure Django settings include:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### WebSocket Connection Failed
- Check WebSocket URL in `.env.local`
- Verify JWT token is valid
- Ensure Django channels is running

### 401 Unauthorized
- Check if token is expired (use token refresh)
- Verify token is included in Authorization header
- Ensure user is authenticated

## Support

For issues or questions, refer to:
- Backend API docs: `/backend/README.md`
- Setup guide: `/docs/SETUP_GUIDE.md`
- Quick start: `/docs/QUICK_START.md`
