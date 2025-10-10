from django.urls import path
from .views import (
    UserRegistrationView, login_view, logout_view, UserProfileView,
    change_password_view, forgot_password_view, reset_password_view,
    APIKeyViewSet, delete_api_key_view, UserSessionListView
)

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    
    # Profile management
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', change_password_view, name='change_password'),
    
    # Password reset
    path('forgot-password/', forgot_password_view, name='forgot_password'),
    path('reset-password/', reset_password_view, name='reset_password'),
    
    # API Keys
    path('api-keys/', APIKeyViewSet.as_view(), name='api_keys'),
    path('api-keys/<uuid:key_id>/', delete_api_key_view, name='delete_api_key'),
    
    # Sessions
    path('sessions/', UserSessionListView.as_view(), name='user_sessions'),
]