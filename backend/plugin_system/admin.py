from django.contrib import admin
from .models import Plugin, PluginInstallation, CustomAgentPlugin, PluginReview, PluginAPIKey


@admin.register(Plugin)
class PluginAdmin(admin.ModelAdmin):
    list_display = ['name', 'version', 'category', 'author', 'is_verified', 'is_active', 'rating', 'download_count']
    list_filter = ['category', 'is_verified', 'is_active', 'created_at']
    search_fields = ['name', 'author', 'description']
    readonly_fields = ['id', 'download_count', 'rating', 'rating_count', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(PluginInstallation)
class PluginInstallationAdmin(admin.ModelAdmin):
    list_display = ['plugin', 'user', 'is_enabled', 'usage_count', 'installed_at']
    list_filter = ['is_enabled', 'installed_at']
    search_fields = ['plugin__name', 'user__username']
    readonly_fields = ['id', 'installed_at', 'updated_at']


@admin.register(CustomAgentPlugin)
class CustomAgentPluginAdmin(admin.ModelAdmin):
    list_display = ['agent', 'plugin', 'total_invocations', 'success_rate', 'created_at']
    list_filter = ['created_at']
    search_fields = ['agent__name', 'plugin__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(PluginReview)
class PluginReviewAdmin(admin.ModelAdmin):
    list_display = ['plugin', 'user', 'rating', 'helpful_count', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['plugin__name', 'user__username', 'review_text']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(PluginAPIKey)
class PluginAPIKeyAdmin(admin.ModelAdmin):
    list_display = ['installation', 'service_name', 'is_active', 'expires_at', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['service_name', 'installation__plugin__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
