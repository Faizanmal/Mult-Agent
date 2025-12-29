"""
User Feedback URLs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserFeedbackViewSet, AgentRatingViewSet, FeedbackTrendViewSet

router = DefaultRouter()
router.register(r'feedback', UserFeedbackViewSet, basename='feedback')
router.register(r'ratings', AgentRatingViewSet, basename='ratings')
router.register(r'trends', FeedbackTrendViewSet, basename='trends')

urlpatterns = [
    path('', include(router.urls)),
]
