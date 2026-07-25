# 403 Error Fix - Visual Diagrams

## Error Flow Diagram

### BEFORE (Broken):
```
┌─────────────────────────────────────┐
│  Frontend (Next.js)                 │
│  Makes API Request                  │
└────────────────┬────────────────────┘
                 │
                 │ GET /agents/api/agents/
                 │ (No token)
                 ▼
┌─────────────────────────────────────┐
│  Backend (Django)                   │
│  Permission Check (RBAC)            │
│  Status: DEBUG=True (but still      │
│  using RBACPermission)              │
└────────────────┬────────────────────┘
                 │
                 │ Check: Is user authenticated?
                 │ Check: Does user have permission?
                 ▼
         ┌───────────────┐
         │   403 ERROR   │ ← User not authenticated!
         └───────┬───────┘
                 │
                 │ Empty error response {}
                 ▼
┌─────────────────────────────────────┐
│  Browser Console                    │
│  "API Error: {}"                    │
│  ❌ No helpful info!                │
└─────────────────────────────────────┘
```

### AFTER (Fixed):
```
┌─────────────────────────────────────┐
│  Frontend (Next.js)                 │
│  Makes API Request                  │
│  Logs: "API Request: { url: '...',  │
│         hasAuth: false }"           │
└────────────────┬────────────────────┘
                 │
                 │ GET /agents/api/agents/
                 │ (No token, but DEBUG=True)
                 ▼
┌─────────────────────────────────────┐
│  Backend (Django)                   │
│  Permission Check                   │
│  Status: DEBUG=True                 │
│  DEFAULT_PERMISSION_CLASSES=AllowAny│
└────────────────┬────────────────────┘
                 │
                 │ DEBUG=True? Yes!
                 │ Allow request ✓
                 ▼
         ┌───────────────┐
         │  200 OK       │ ← Success!
         │  [agents]     │
         └───────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Browser Console                    │
│  "✓ Agents loaded successfully"     │
│  Status: 200, Data: [...]           │
└─────────────────────────────────────┘
```

## Permission Decision Tree

### OLD (Broken):
```
Is DEBUG=True?
    │
    ├─ Yes
    │   └─ Use: 'rest_framework.permissions.AllowAny'  # STRING!
    │       ├─ Might be misinterpreted by DRF
    │       └─ Issue: RBAC still enforced somehow
    │
    └─ No
        └─ Use: 'authentication.rbac.RBACPermission'
```

### NEW (Fixed):
```
Is DEBUG=True?
    │
    ├─ Yes
    │   └─ Use: ['rest_framework.permissions.AllowAny']  # LIST!
    │       └─ ✓ All requests allowed
    │
    └─ No
        └─ Use: ['authentication.rbac.RBACPermission']
            └─ ✓ Strict permission checking
```

## Request/Response Flow

### Development Mode (DEBUG=True):
```
┌────────────┐
│ Frontend   │
└─────┬──────┘
      │
      │ GET /agents/api/agents/
      │ Headers: { Content-Type: application/json }
      │ (No Authorization header)
      │
      ▼
┌────────────────────────────────────┐
│ Django Middleware                  │
│ 1. CORS Middleware ✓ (allowed)     │
│ 2. Auth Middleware (optional)      │
│ 3. Permission Check (AllowAny) ✓   │
└────────────┬───────────────────────┘
             │
             │ ✓ Allowed
             │
             ▼
┌────────────────────────────────────┐
│ View Handler                       │
│ AgentViewSet.list()                │
└────────────┬───────────────────────┘
             │
             │ Fetch agents
             │
             ▼
┌────────────────────────────────────┐
│ Response                           │
│ 200 OK                             │
│ {                                  │
│   "count": 5,                      │
│   "results": [...]                 │
│ }                                  │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────┐
│ Frontend   │ ✓ Success!
└────────────┘
```

### Production Mode (DEBUG=False):
```
┌────────────┐
│ Frontend   │
└─────┬──────┘
      │
      │ GET /agents/api/agents/
      │ Headers: { 
      │   Content-Type: application/json,
      │   Authorization: Token xyz123
      │ }
      │
      ▼
┌────────────────────────────────────┐
│ Django Middleware                  │
│ 1. CORS Middleware ✓               │
│ 2. Auth Middleware (TokenAuth) ✓   │
│ 3. Permission Check (RBAC)         │
└────────────┬───────────────────────┘
             │
             │ Valid token? ✓
             │ Has permission? ?
             │
             ├─ Yes → View Handler
             │        └─ 200 OK
             │
             └─ No  → Permission Denied
                      └─ 403 Error with details
                         {
                           "detail": "No permission..."
                         }
```

## Error Logging Comparison

### BEFORE (Broken):
```javascript
Console Output:
┌─────────────────────────────────┐
│ API Error: {}                   │ ← Empty!
│                                 │ ← No useful info
│                                 │ ← No way to debug
└─────────────────────────────────┘

Network Tab:
┌─────────────────────────────────┐
│ Status: 403 Forbidden           │
│ Response: (empty or {})         │
│ Why: No idea! 🤷               │
└─────────────────────────────────┘
```

### AFTER (Fixed):
```javascript
Console Output (Success):
┌─────────────────────────────────┐
│ API Request: {                  │
│   url: '/agents/api/agents/',   │
│   method: 'get',                │
│   hasAuth: false,               │
│   headers: {                    │
│     authorization: 'missing',   │
│     contentType: 'application/json'
│   }                             │
│ }                               │
│                                 │
│ ✓ Status 200 OK                 │
│ Data: { count: 5, results: [...]}
└─────────────────────────────────┘

Console Output (Error):
┌─────────────────────────────────┐
│ API Error Details: {            │
│   status: 403,                  │
│   message: 'Request failed...',  │
│   data: {                       │
│     detail: 'Auth credentials...'
│   },                            │
│   url: '/agents/api/agents/',   │
│   method: 'get',                │
│   headers: {                    │
│     authorization: 'missing',   │
│   }                             │
│ }                               │
│                                 │
│ Access Forbidden (403): {       │
│   detail: 'Auth credentials...' │
│   hasToken: false               │
│ }                               │
└─────────────────────────────────┘

Network Tab:
┌─────────────────────────────────┐
│ Status: 200 OK                  │
│ Response: Full data available   │
│ Headers: CORS headers present   │
│ Why: DEBUG mode allows all! ✓   │
└─────────────────────────────────┘
```

## Settings Configuration Flow

### Before (Incorrect):
```
settings.py
    │
    ├─ DEBUG = True
    │
    └─ REST_FRAMEWORK = {
           'DEFAULT_PERMISSION_CLASSES': [
               'rest_framework.permissions.AllowAny' 
               if DEBUG 
               else 'authentication.rbac.RBACPermission'  ← STRING! BAD!
           ]
       }
       
Issue:
    └─ String might not be properly parsed as a permission class
    └─ Django might fall back to default permissions
    └─ RBAC permission still gets enforced
    └─ Result: 403 Forbidden
```

### After (Correct):
```
settings.py
    │
    ├─ DEBUG = True
    │
    └─ REST_FRAMEWORK = {
           'DEFAULT_PERMISSION_CLASSES': [
               'rest_framework.permissions.AllowAny'
           ] if DEBUG else [                              ← LIST! GOOD!
               'authentication.rbac.RBACPermission'
           ]
       }

Result:
    ├─ When DEBUG=True: Use ['rest_framework.permissions.AllowAny']
    │   └─ All requests allowed ✓
    │
    └─ When DEBUG=False: Use ['authentication.rbac.RBACPermission']
        └─ Strict permission checking ✓
```

## Debugging Decision Tree

### Getting 403 Error?

```
1. Check DEBUG setting
   │
   ├─ DEBUG=True in settings.py?
   │   ├─ YES → Check console logs
   │   │        └─ Is auth header 'missing'?
   │   │           ├─ YES → Should be allowed anyway! Check view permissions
   │   │           └─ NO → Token present but still 403? Check RBAC
   │   │
   │   └─ NO → Check if token present
   │            ├─ NO → User needs to login first
   │            └─ YES → Check user role/permissions in RBAC
   │
2. Check permission class in settings.py line 239-243
   │
   ├─ Is it a list? (surrounded by [ ])
   │   ├─ YES → ✓ Correct format
   │   └─ NO → ❌ FIX IT! Should be list
   │
3. Check if view overrides permissions
   │
   ├─ Search for "permission_classes" in views.py
   │   ├─ Found override? Check if it respects DEBUG mode
   │   └─ Not found? Using global setting ✓
   │
4. Restart backend and clear browser cache
   │
   └─ Try again

If still broken → Check console error message for specific reason
```

## Quick Reference

| Situation | Expected | Actual | Fix |
|-----------|----------|--------|-----|
| DEBUG=True, no token | 200 OK | 403 Forbidden | Restart backend, check settings |
| DEBUG=False, no token | 401 Unauthorized | 403 Forbidden | User must login first |
| DEBUG=True, with token | 200 OK | 403 Forbidden | Check user role/permissions |
| DEBUG=False, with token | 200 OK (if authorized) | 403 Forbidden | Check RBAC permissions |

## Console Debugging Checklist

When you see a 403 error:

```javascript
// 1. Check console output
console.log('Status:', 403)
console.log('Error data:', {...}) // Should show detail reason

// 2. Check if token exists
console.log('Token exists:', !!localStorage.getItem('auth_token'))

// 3. Check if DEBUG mode
console.log('NODE_ENV:', process.env.NODE_ENV)

// 4. Try manual request
fetch('http://localhost:8000/agents/api/agents/', {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(e => console.error('Error:', e))

// If manual fetch works but API client doesn't → Interceptor issue
// If manual fetch fails too → Backend permission issue
```
