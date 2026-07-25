# API 403 Forbidden Error - Fix Summary

## Problem
You were getting a 403 (Forbidden) error when making API requests from the Next.js frontend to the Django backend. The error response was empty `{}`, making it hard to debug.

## Root Cause
The backend has role-based access control (RBAC) that restricts API access to authenticated users. Even though `DEBUG = True`, the REST Framework's default permission class was set to `RBACPermission` which requires authentication.

## Solution Applied

### 1. Fixed REST Framework Settings
Updated `backend/backend/settings.py` to properly handle DEBUG mode:

```python
'DEFAULT_PERMISSION_CLASSES': [
    'rest_framework.permissions.AllowAny',
] if DEBUG else [
    'authentication.rbac.RBACPermission',
],
```

This ensures that in development (DEBUG=True), all endpoints allow unauthenticated access.

### 2. Improved API Error Logging
Updated `frontend/src/lib/api.ts` with detailed error logging that includes:
- HTTP status code
- Error message
- Error data from backend
- URL and method of the failed request
- Whether authentication token was present
- CORS and header information

## What to Do Next

### Test the Fix
1. Restart your Django backend: `python manage.py runserver`
2. Refresh your Next.js frontend (should hot-reload)
3. Check the browser console (F12) for detailed API error messages
4. Try making an API call again

### If You Still See 403 Errors
Check the browser console for the detailed error logs that now include:
- Missing authorization header
- Specific permission denied message
- The endpoint URL that failed

### For Production
When `DEBUG = False`:
1. Users MUST authenticate first
2. The frontend should call the login endpoint: `POST /auth/login/`
3. The backend returns a token
4. Store this token in localStorage as `auth_token`
5. The API client automatically includes this token in all subsequent requests

### Authentication Flow in Production
```typescript
// 1. Login
const { token, user } = await apiClient.login({
  username: 'user@example.com',
  password: 'password'
});
// Token is automatically saved to localStorage

// 2. Use API (token is automatically included)
const agents = await apiClient.getAgents();

// 3. Logout
await apiClient.logout();
// Token is automatically removed from localStorage
```

## Files Modified
- `backend/backend/settings.py` - Fixed REST_FRAMEWORK DEFAULT_PERMISSION_CLASSES
- `frontend/src/lib/api.ts` - Enhanced error logging with detailed debugging info

## Testing Commands

### Backend Health Check
```bash
curl http://localhost:8000/agents/api/agents/ -v
```

Should return 200 with agent list (in DEBUG mode).

### Frontend Testing
Open browser console (F12) and run:
```javascript
// Test API client
const response = await apiClient.getAgents();
console.log('Agents:', response);
```

## Debugging Tips

1. **Check Django Settings**: Ensure `DEBUG = True` in `settings.py`
2. **Check Console Logs**: Browser console will now show detailed error info
3. **Check Network Tab**: In DevTools Network tab, look at response headers and body
4. **Check Token**: In browser console: `localStorage.getItem('auth_token')`
5. **CORS Issues**: Check if backend has `CORS_ALLOW_ALL_ORIGINS = True` (it does in DEBUG mode)

## Related Configuration

### CORS Configuration (in settings.py)
- Development: `CORS_ALLOW_ALL_ORIGINS = True`
- Production: CORS must be explicitly configured for allowed origins

### Authentication Classes (in settings.py)
```python
'DEFAULT_AUTHENTICATION_CLASSES': [
    'authentication.jwt_auth.JWTAuthentication',
    'rest_framework.authentication.SessionAuthentication',
    'rest_framework.authentication.TokenAuthentication',
],
```

The backend supports multiple auth methods. The frontend uses Token authentication (format: `Token <token>`).

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 403 with empty error | Restart Django server and check DEBUG=True |
| 401 Unauthorized | Login first to get a token |
| CORS errors | Check CORS_ALLOW_ALL_ORIGINS setting |
| Missing auth header | Ensure token is in localStorage |
| Token not saving | Check browser localStorage permissions |

## Next Steps

1. Check if the 403 errors are resolved
2. If not, review the detailed console logs
3. Create test cases for API endpoints
4. Consider adding authentication UI for production mode
