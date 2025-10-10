from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar = models.URLField(blank=True, null=True)
    role = models.CharField(
        max_length=20, 
        choices=[('admin', 'Admin'), ('user', 'User'), ('viewer', 'Viewer')], 
        default='user'
    )
    subscription_tier = models.CharField(
        max_length=20,
        choices=[('free', 'Free'), ('pro', 'Pro'), ('enterprise', 'Enterprise')],
        default='free'
    )
    is_2fa_enabled = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    user_timezone = models.CharField(max_length=50, default='UTC')
    last_activity = models.DateTimeField(auto_now=True)
    
    # Enhanced fields
    email = models.EmailField(unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    
    # Account security
    last_password_change = models.DateTimeField(default=timezone.now)
    password_reset_required = models.BooleanField(default=False)
    account_locked = models.BooleanField(default=False)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    last_failed_login = models.DateTimeField(blank=True, null=True)
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    theme_preference = models.CharField(
        max_length=10, 
        choices=[('light', 'Light'), ('dark', 'Dark'), ('auto', 'Auto')],
        default='auto'
    )
    language = models.CharField(max_length=10, default='en')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def get_permissions(self):
        """Get user permissions based on role"""
        permission_map = {
            'admin': [
                'view_all', 'create_all', 'edit_all', 'delete_all',
                'manage_users', 'manage_system', 'manage_billing'
            ],
            'user': [
                'view_own', 'create_own', 'edit_own', 'delete_own',
                'execute_workflows', 'manage_agents'
            ],
            'viewer': [
                'view_own', 'view_shared'
            ]
        }
        return permission_map.get(self.role, [])

class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    # Enhanced fields
    device_info = models.JSONField(default=dict, blank=True)

class LoginAttempt(models.Model):
    email = models.EmailField()
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField()
    failure_reason = models.CharField(max_length=255, blank=True, null=True)
    user_agent = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Enhanced fields
    suspicious = models.BooleanField(default=False)
    blocked = models.BooleanField(default=False)
    
class TwoFactorAuth(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='two_factor')
    secret_key = models.CharField(max_length=255)
    backup_codes = models.JSONField(default=list)
    is_enabled = models.BooleanField(default=False)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class PasswordReset(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.used and not self.is_expired()

class APIKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255)
    key = models.CharField(max_length=255, unique=True)
    permissions = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Enhanced fields
    rate_limit = models.PositiveIntegerField(default=1000)  # Requests per hour
    usage_count = models.PositiveIntegerField(default=0)

class UserRole(models.Model):
    """User roles and permissions"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    permissions = models.JSONField(default=list)
    is_system_role = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class UserRoleAssignment(models.Model):
    """Assign roles to users"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='role_assignments')
    role = models.ForeignKey(UserRole, on_delete=models.CASCADE)
    
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='role_assignments_made')
    assigned_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'role']
    
    def __str__(self):
        return f"{self.user.username} - {self.role.name}"
