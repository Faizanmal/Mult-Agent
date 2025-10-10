from django.urls import path
from . import views, api_views

app_name = 'api_integrations'

urlpatterns = [
    # Original integration endpoints
    path('integrations/', views.APIIntegrationListCreateView.as_view(), name='integrations'),
    path('integrations/<uuid:pk>/', views.APIIntegrationDetailView.as_view(), name='integration_detail'),
    path('integrations/<uuid:pk>/test/', views.test_integration_view, name='test_integration'),
    path('integrations/<uuid:pk>/execute/', views.execute_integration_view, name='execute_integration'),
    path('templates/', views.IntegrationTemplateListView.as_view(), name='templates'),
    
    # New API endpoints for frontend
    path('api/integrations/', api_views.integrations_list, name='api_integrations'),
    path('api/integrations/calls/', api_views.integrations_calls, name='api_integrations_calls'),
    path('api/integrations/templates/', api_views.integrations_templates, name='api_integrations_templates'),
    
    path('api/reports/charts/', api_views.reports_charts, name='api_reports_charts'),
    path('api/reports/metrics/', api_views.reports_metrics, name='api_reports_metrics'),
    path('api/reports/templates/', api_views.reports_templates, name='api_reports_templates'),
    path('api/reports/custom/', api_views.reports_custom, name='api_reports_custom'),
    
    path('api/notifications/', api_views.notifications_list, name='api_notifications'),
    path('api/notifications/email-templates/', api_views.notifications_email_templates, name='api_notifications_email_templates'),
    path('api/notifications/email-campaigns/', api_views.notifications_email_campaigns, name='api_notifications_email_campaigns'),
    path('api/notifications/rules/', api_views.notifications_rules, name='api_notifications_rules'),
    path('api/notifications/settings/', api_views.notifications_settings, name='api_notifications_settings'),
    
    path('api/data-pipelines/', api_views.data_pipelines, name='api_data_pipelines'),
    path('api/data-connections/', api_views.data_connections, name='api_data_connections'),
    path('api/data-pipeline-executions/', api_views.data_pipeline_executions, name='api_data_pipeline_executions'),
    path('api/data-quality-rules/', api_views.data_quality_rules, name='api_data_quality_rules'),
    path('api/data-pipeline-templates/', api_views.data_pipeline_templates, name='api_data_pipeline_templates'),
]