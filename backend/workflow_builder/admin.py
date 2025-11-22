from django.contrib import admin
from .models import (
    WorkflowTemplate, VisualWorkflow, WorkflowNode,
    WorkflowExecution, WorkflowVersion
)


@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'usage_count', 'rating', 'is_public', 'created_by', 'created_at']
    list_filter = ['category', 'is_public', 'created_at']
    search_fields = ['name', 'description', 'tags']


@admin.register(VisualWorkflow)
class VisualWorkflowAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'status', 'version', 'execution_count', 'updated_at']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['name', 'description']


@admin.register(WorkflowNode)
class WorkflowNodeAdmin(admin.ModelAdmin):
    list_display = ['label', 'workflow', 'node_type', 'created_at']
    list_filter = ['node_type', 'created_at']
    search_fields = ['label']


@admin.register(WorkflowExecution)
class WorkflowExecutionAdmin(admin.ModelAdmin):
    list_display = ['workflow', 'status', 'duration_ms', 'started_at', 'completed_at']
    list_filter = ['status', 'created_at']


@admin.register(WorkflowVersion)
class WorkflowVersionAdmin(admin.ModelAdmin):
    list_display = ['workflow', 'version_number', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['change_description']
