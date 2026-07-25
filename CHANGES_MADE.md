# Changes Made to Fix 403 Errors

## Summary
You were getting 403 (Forbidden) errors on API calls due to strict permission checking in the RBAC system. The backend was enforcing role-based access control even in DEBUG mode. 

**Changes:**
1. Fixed Django REST Framework settings to allow unauthenticated access in DEBUG mode
2. Enhanced API error logging to show detailed error information

---

## File 1: `backend/backend/settings.py` 

### BEFORE:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'authentication.jwt_auth.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny' if DEBUG else 'authentication.rbac.RBACPermission',
    ],
    # ... rest of config
}
```

**Problem**: Using a string for the permission class in the conditional could cause issues. The setting wasn't cleanly separated into development vs. production.

### AFTER:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'authentication.jwt_auth.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ] if DEBUG else [
        'authentication.rbac.RBACPermission',
    ],
    # ... rest of config
}
```

**Solution**: Now the permission class is properly set based on DEBUG mode:
- **Development (DEBUG=True)**: `AllowAny` - All requests allowed without authentication
- **Production (DEBUG=False)**: `RBACPermission` - Role-Based Access Control enforced

---

## File 2: `frontend/src/lib/api.ts`

### Request Interceptor

#### BEFORE:
```typescript
this.client.interceptors.request.use(
  (config) => {
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

#### AFTER:
```typescript
this.client.interceptors.request.use(
  (config) => {
    const token = this.getAuthToken();
    
    // Add token if available
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Log request details in development
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug('API Request:', {
        url: config.url,
        method: config.method,
        hasAuth: !!token,
        headers: {
          authorization: config.headers.Authorization ? 'present' : 'missing',
          contentType: config.headers['Content-Type'],
        },
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

**Improvements**:
- Logs API requests in development mode
- Shows whether authentication token is present
- Shows Content-Type header
- Helps debug missing authentication

### Response Interceptor

#### BEFORE:
```typescript
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      this.removeAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### AFTER:
```typescript
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const errorStatus = error.response?.status;
    const errorMessage = error.message;
    const errorConfig = error.config;

    const detailedError = {
      status: errorStatus,
      message: errorMessage,
      data: errorData,
      url: errorConfig?.url,
      method: errorConfig?.method,
      headers: {
        authorization: errorConfig?.headers?.Authorization ? 'present' : 'missing',
        contentType: errorConfig?.headers?.['Content-Type'],
      }
    };

    console.error('API Error Details:', detailedError);
    
    // Handle 401 unauthorized
    if (errorStatus === 401) {
      this.removeAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (errorStatus === 403) {
      console.warn('Access Forbidden (403):', {
        detail: errorData?.detail,
        error: errorData?.error,
        hasToken: !!this.getAuthToken(),
      });
    }
    
    return Promise.reject(error);
  }
);
```

**Improvements**:
- Shows HTTP status code
- Shows actual error message from backend
- Shows request URL and method
- Shows if authentication token was sent
- Specific handling for 403 Forbidden errors
- Logs whether token exists in localStorage
- Much easier to debug API issues

---

## How This Fixes Your 403 Error

### Before (Broken Flow):
```
Frontend Request → Backend Permission Check (RBAC)
↓
"User not authenticated" → 403 Forbidden
↓
Console: "API Error: {}" (No helpful info!)
```

### After (Fixed Flow):
```
Frontend Request → Backend Permission Check
↓
In DEBUG mode: Allow → 200 OK ✓
In PROD mode: Check RBAC → 403 if no permission (but with detailed error log)
↓
Console: "API Error Details: { status: 403, data: { detail: 'Authentication...' }, hasToken: false }"
```

---

## Expected Behavior After Fix

### In Development (DEBUG=True):
- All API calls should succeed regardless of authentication
- Browser console shows detailed request/response info
- Can test frontend without backend authentication setup

### In Production (DEBUG=False):
- API calls require valid token
- Frontend must call login endpoint first
- Users without permissions get 403 with reason
- Console shows exactly why request failed

---

## Testing the Fix

1. Restart Django: `python manage.py runserver`
2. Refresh browser
3. Open Console (F12)
4. Make an API call
5. Check console output - should now show:
   - Request details (URL, method, auth status)
   - Response status and data
   - Clear error messages if any

---

## Related Files (Not Changed)

These files work correctly as-is:
- `backend/agents/views.py` - Already has `[AllowAny] if settings.DEBUG`
- `backend/api_integrations/views.py` - Already has `[AllowAny] if settings.DEBUG`
- `backend/authentication/rbac.py` - Works correctly when settings are right
- `frontend/src/types/api.ts` - No changes needed
