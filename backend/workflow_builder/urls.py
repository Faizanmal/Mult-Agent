from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkflowTemplateViewSet, VisualWorkflowViewSet,
    WorkflowExecutionViewSet
)

router = DefaultRouter()
router.register(r'templates', WorkflowTemplateViewSet, basename='template')
router.register(r'workflows', VisualWorkflowViewSet, basename='workflow')
router.register(r'executions', WorkflowExecutionViewSet, basename='execution')

urlpatterns = [
    path('api/', include(router.urls)),
]
