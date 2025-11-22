from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'models', views.AIModelConfigViewSet, basename='ai-model')
router.register(r'intelligence', views.MultiModalIntelligenceViewSet, basename='multimodal-intelligence')

app_name = 'multi_model_intelligence'

urlpatterns = [
    path('api/', include(router.urls)),
]