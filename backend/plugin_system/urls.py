from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PluginViewSet, PluginInstallationViewSet, CustomAgentPluginViewSet

router = DefaultRouter()
router.register(r'marketplace', PluginViewSet, basename='plugin')
router.register(r'installations', PluginInstallationViewSet, basename='plugin-installation')
router.register(r'custom-agents', CustomAgentPluginViewSet, basename='custom-agent-plugin')

urlpatterns = [
    path('', include(router.urls)),
]
