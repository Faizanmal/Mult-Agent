#!/usr/bin/env bash
# Verification script for 403 Error Fix
# Run this to verify all changes were applied correctly

echo "🔍 Verifying 403 Error Fix..."
echo ""

# Check 1: Verify backend settings change
echo "📋 Check 1: Verifying backend settings.py..."
if grep -A4 "'DEFAULT_PERMISSION_CLASSES':" backend/backend/settings.py | grep -q "\] if DEBUG else"; then
    echo "✅ Backend settings fixed correctly"
else
    echo "❌ Backend settings NOT fixed - check line 239-243"
fi
echo ""

# Check 2: Verify DEBUG=True
echo "📋 Check 2: Verifying DEBUG=True..."
if grep "^DEBUG = True" backend/backend/settings.py > /dev/null; then
    echo "✅ DEBUG mode is enabled"
else
    echo "❌ DEBUG is not True - this will cause permission issues"
fi
echo ""

# Check 3: Verify API client has enhanced logging
echo "📋 Check 3: Verifying frontend API client logging..."
if grep -q "console.debug('API Request':" frontend/src/lib/api.ts; then
    echo "✅ Request logging added"
else
    echo "❌ Request logging not found"
fi

if grep -q "console.error('API Error Details':" frontend/src/lib/api.ts; then
    echo "✅ Error logging enhanced"
else
    echo "❌ Error logging not enhanced"
fi

if grep -q "Handle 403 Forbidden" frontend/src/lib/api.ts; then
    echo "✅ 403 handling added"
else
    echo "❌ 403 handling not found"
fi
echo ""

# Check 4: Verify CORS settings
echo "📋 Check 4: Checking CORS configuration..."
if grep "CORS_ALLOW_ALL_ORIGINS = True" backend/backend/settings.py > /dev/null; then
    echo "✅ CORS is properly configured for DEBUG mode"
else
    echo "⚠️  Check CORS settings manually"
fi
echo ""

# Check 5: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Fix Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Restart backend: python manage.py runserver"
echo "2. Refresh frontend in browser"
echo "3. Open Console (F12) and test API calls"
echo "4. Check console for detailed error messages"
echo ""
echo "For more info, see:"
echo "  - README_FIX.md - Quick start guide"
echo "  - FIX_SUMMARY.md - Technical details"
echo "  - CHANGES_MADE.md - Before/after code"
echo "  - VISUAL_DIAGRAMS.md - Flow diagrams"
echo "  - API_403_TESTING.md - Testing guide"
echo ""
