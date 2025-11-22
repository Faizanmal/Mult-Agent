from django.contrib import admin
from .models import WebhookEndpoint, WebhookDelivery, NotificationChannel, WebhookNotification, EventLog


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'url', 'is_active', 'total_deliveries', 'successful_deliveries', 'last_triggered']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'user__username', 'url']
    readonly_fields = ['id', 'total_deliveries', 'successful_deliveries', 'failed_deliveries', 'created_at', 'updated_at']


@admin.register(WebhookDelivery)
class WebhookDeliveryAdmin(admin.ModelAdmin):
    list_display = ['webhook', 'event_type', 'success', 'status_code', 'attempt_number', 'duration_ms', 'created_at']
    list_filter = ['success', 'event_type', 'created_at']
    search_fields = ['webhook__name', 'event_type']
    readonly_fields = ['id', 'created_at']


@admin.register(NotificationChannel)
class NotificationChannelAdmin(admin.ModelAdmin):
    list_display = ['channel_name', 'user', 'channel_type', 'is_active', 'created_at']
    list_filter = ['channel_type', 'is_active', 'created_at']
    search_fields = ['channel_name', 'user__username']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(WebhookNotification)
class WebhookNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'event_type', 'priority', 'is_read', 'is_sent', 'created_at']
    list_filter = ['priority', 'is_read', 'is_sent', 'event_type', 'created_at']
    search_fields = ['title', 'message', 'user__username']
    readonly_fields = ['id', 'created_at']


@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'session', 'user', 'source', 'created_at']
    list_filter = ['event_type', 'created_at', 'source']
    search_fields = ['event_type', 'user__username', 'source']
    readonly_fields = ['id', 'created_at']
