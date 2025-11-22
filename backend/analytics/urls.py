from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PerformanceMetricViewSet, CostAnalysisViewSet,
    WorkflowOptimizationViewSet, AnomalyDetectionViewSet,
    PredictiveAnalyticsViewSet
)

router = DefaultRouter()
router.register(r'metrics', PerformanceMetricViewSet, basename='metric')
router.register(r'costs', CostAnalysisViewSet, basename='cost')
router.register(r'optimizations', WorkflowOptimizationViewSet, basename='optimization')
router.register(r'anomalies', AnomalyDetectionViewSet, basename='anomaly')
router.register(r'predictions', PredictiveAnalyticsViewSet, basename='prediction')

urlpatterns = [
    path('api/', include(router.urls)),
]
