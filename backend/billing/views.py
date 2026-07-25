"""Billing API views — Stripe checkout and portal."""
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from authentication.models import Workspace, WorkspaceMembership
from .services import create_checkout_session, get_customer_portal


def _user_workspace(user):
    membership = (
        WorkspaceMembership.objects.filter(user=user)
        .select_related('workspace')
        .first()
    )
    if membership:
        return membership.workspace
    workspace = Workspace.objects.create(name=f"{user.username}'s Workspace")
    WorkspaceMembership.objects.create(
        workspace=workspace,
        user=user,
        role='admin',
    )
    return workspace


@api_view(['POST'])
@permission_classes([AllowAny] if settings.DEBUG else [IsAuthenticated])
def create_checkout_session_view(request):
    """Create a Stripe Checkout session for upgrading a plan."""
    if not request.user.is_authenticated and not settings.DEBUG:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    price_id = request.data.get('priceId') or request.data.get('price_id')
    if not price_id:
        return Response({'error': 'priceId is required'}, status=status.HTTP_400_BAD_REQUEST)

    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    success_url = request.data.get('success_url') or f'{frontend}/settings/billing?success=1'
    cancel_url = request.data.get('cancel_url') or f'{frontend}/settings/billing?canceled=1'

    user = request.user
    if not user.is_authenticated:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            email='default@example.com',
            defaults={'username': 'default_user'},
        )

    try:
        workspace = _user_workspace(user)
        url = create_checkout_session(workspace, price_id, success_url, cancel_url)
        return Response({'url': url, 'sessionId': url})
    except Exception as exc:
        # Demo-friendly response when Stripe keys are missing
        if 'sk_test_dummy' in str(getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_dummy')) or 'Invalid API Key' in str(exc):
            return Response({
                'error': 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.',
                'demo': True,
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def customer_portal_view(request):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    return_url = request.data.get('return_url') or f'{frontend}/settings/billing'
    try:
        workspace = _user_workspace(request.user)
        url = get_customer_portal(workspace, return_url)
        return Response({'url': url})
    except Exception as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny] if settings.DEBUG else [IsAuthenticated])
def billing_status_view(request):
    """Return current plan/usage summary for the billing UI."""
    user = request.user if request.user.is_authenticated else None
    tier = getattr(user, 'subscription_tier', None) or 'free'
    return Response({
        'plan': tier,
        'usage': {
            'used_tokens': 0,
            'total_tokens': 100_000 if tier == 'free' else 1_000_000,
            'percentage': 0,
        },
        'stripe_configured': bool(
            getattr(settings, 'STRIPE_SECRET_KEY', '')
            and 'dummy' not in getattr(settings, 'STRIPE_SECRET_KEY', 'dummy')
        ),
    })
