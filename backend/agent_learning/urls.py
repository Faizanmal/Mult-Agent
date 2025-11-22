from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AgentLearningViewSet, AdaptiveStrategyViewSet, ReinforcementStateViewSet
)

router = DefaultRouter()
router.register(r'profiles', AgentLearningViewSet, basename='learning-profile')
router.register(r'strategies', AdaptiveStrategyViewSet, basename='adaptive-strategy')
router.register(r'states', ReinforcementStateViewSet, basename='rl-state')

urlpatterns = [
    path('', include(router.urls)),
]
