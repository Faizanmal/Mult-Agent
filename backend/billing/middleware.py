from django.http import JsonResponse

class QuotaEnforcementMiddleware:
    """
    Middleware to enforce usage quotas based on the Workspace's subscription tier.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We only enforce quotas on API endpoints that consume resources (e.g., chat completions)
        # Assuming the path might be /agents/api/sessions/<id>/send_message/
        if request.path.startswith('/agents/api/sessions/') and request.method == 'POST':
            # Check user workspace
            if request.user.is_authenticated:
                # Find the user's primary workspace (simplification)
                membership = request.user.workspace_memberships.first()
                if membership:
                    workspace = membership.workspace
                    tier = workspace.subscription_tier
                    
                    # Logic to count usage and check limit
                    # For demonstration, we simply check a hardcoded limit.
                    # In a real app, you would query redis or the database for actual usage.
                    usage_count = 0 # Replace with actual cache/db lookup
                    
                    if tier == 'free' and usage_count >= 100:
                        return JsonResponse({
                            'error': 'Payment Required',
                            'message': 'You have exceeded your free tier limits. Please upgrade to Pro.'
                        }, status=402)
                    
                    elif tier == 'pro' and usage_count >= 10000:
                        return JsonResponse({
                            'error': 'Payment Required',
                            'message': 'You have exceeded your Pro tier limits.'
                        }, status=402)

        response = self.get_response(request)
        return response
