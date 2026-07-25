# API 403 Error - Quick Testing Guide

## Step 1: Verify Backend Configuration
Open `backend/backend/settings.py` and confirm:
- `DEBUG = True` (line 37)
- `DEFAULT_PERMISSION_CLASSES` is set to `AllowAny` for DEBUG mode (lines 239-243)

## Step 2: Restart Backend
```bash
# Stop the running server (Ctrl+C if running)
# Then restart
cd backend
python manage.py runserver
```

Expected output:
```
Starting development server at http://127.0.0.1:8000/
```

## Step 3: Test Frontend API Calls
1. Open the Next.js app in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. The improved error logging should show:
   - Whether authorization token was sent
   - Exact HTTP status and message
   - URL and method that was called

## Step 4: Check Console Output
You should see detailed logs like:
```javascript
// Request log (if in development):
API Request: {
  url: '/agents/api/agents/',
  method: 'get',
  hasAuth: false,
  headers: { authorization: 'missing', contentType: 'application/json' }
}

// Success (200):
// Should see your data returned

// Error (403):
API Error Details: {
  status: 403,
  message: 'Request failed with status code 403',
  data: { detail: 'Authentication credentials were not provided.' },
  url: '/agents/api/agents/',
  method: 'get',
  headers: { authorization: 'missing' }
}
```

## Step 5: Debug Based on Console Output

### If still getting 403:
1. **Check permissions on specific view** - Some views may override global permissions
   - Look in `backend/agents/views.py` line 38: `permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]`
   - This should auto-allow in DEBUG mode
   
2. **Check if middleware is blocking** - Look for security/auth middleware in settings.py
   - Lines 103-109 have several middleware that might affect permissions

3. **Check view-level permission overrides**
   - Search for `permission_classes` in the view file
   - Each view can override the default

### If 200 OK but getting empty data:
- Check the Network tab to see actual response
- Some endpoints may require specific query parameters or body

### If CORS errors:
- Check line 205-218 in settings.py
- In DEBUG mode: `CORS_ALLOW_ALL_ORIGINS = True` 
- This should allow all origins

## Step 6: Verify Fix with curl
```bash
# Test without auth (should work in DEBUG mode)
curl http://localhost:8000/agents/api/agents/ -v

# You should see:
# HTTP/1.1 200 OK
# With JSON response
```

## Next: If Still Broken
Create an issue with:
1. Screenshot of Network tab showing the failed request
2. Full error message from browser console
3. Response headers from the failed request
4. Your `DEBUG` setting value
5. Line 239-243 of your settings.py (REST_FRAMEWORK config)

## Files to Check
- `backend/backend/settings.py` - Contains DEBUG and REST_FRAMEWORK config
- `frontend/src/lib/api.ts` - Contains API client with improved error logging
- Individual view files - May have permission overrides

## Quick Fix if Still Needed
If you're still seeing 403s after restarting:

1. In `backend/backend/settings.py`, ensure this line exists exactly as shown:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [...],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ] if DEBUG else [
        'authentication.rbac.RBACPermission',
    ],
```

2. Verify `DEBUG = True` is on its own line with nothing conditionally setting it

3. Search for any other `DEFAULT_PERMISSION_CLASSES` definitions in settings.py (there should be only one)

4. Force refresh browser (Ctrl+Shift+R or Cmd+Shift+R on Mac)

5. Clear browser cache and localStorage:
```javascript
// In browser console:
localStorage.clear()
location.reload()
```
