from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import NotificationCampaign, NotificationTemplate, NotificationRule, NotificationPreference, NotificationSubscription
from .serializers import (
    NotificationCampaignSerializer, NotificationTemplateSerializer,
    NotificationRuleSerializer, NotificationPreferenceSerializer,
    NotificationSubscriptionSerializer
)


class NotificationCampaignListCreateView(generics.ListCreateAPIView):
    """List and create notification campaigns"""
    serializer_class = NotificationCampaignSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationCampaign.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationCampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete notification campaign"""
    serializer_class = NotificationCampaignSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationCampaign.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_campaign_view(request, pk):
    """Send notification campaign"""
    campaign = get_object_or_404(NotificationCampaign, pk=pk, user=request.user)
    
    # Implementation for sending campaign would go here
    return Response({
        'sent': 100,
        'failed': 5,
        'campaign_id': str(campaign.id)
    })


class NotificationTemplateListCreateView(generics.ListCreateAPIView):
    """List and create notification templates"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationTemplate.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationRuleListCreateView(generics.ListCreateAPIView):
    """List and create notification rules"""
    serializer_class = NotificationRuleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationRule.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats_view(request):
    """Get notification statistics"""
    return Response({
        'stats': {
            'total_sent': 1000,
            'open_rate': 25.5,
            'click_rate': 3.2
        }
    })


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Retrieve and update notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        prefs, created = NotificationPreference.objects.get_or_create(user=self.request.user)
        return prefs


class NotificationSubscriptionListCreateView(generics.ListCreateAPIView):
    """List and create notification subscriptions"""
    serializer_class = NotificationSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationSubscription.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
