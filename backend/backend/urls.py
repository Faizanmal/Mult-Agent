"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('agents/', include('agents.urls')),
    path('mcp/', include('Mcp_Integration.urls')),
    path('models/', include('models.urls')),
    path('coordination/', include('Multi_agents_cordination.urls')),
    path('intelligence/', include('Multi_model_Intelligence.urls')),
    path('performance/', include('real_time_performance.urls')),
    path('use-case/', include('use_case.urls')),
    # Enhanced feature URLs
    path('authentication/api/', include('authentication.urls')),
    path('api-integrations/api/', include('api_integrations.urls')),
    path('reporting/api/', include('reporting.urls')),
    path('notifications/api/', include('notifications.urls')),
    path('data-pipelines/api/', include('data_pipelines.urls')),
    
    # Direct API routes for frontend
    path('', include('api_integrations.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)