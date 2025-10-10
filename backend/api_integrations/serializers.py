from rest_framework import serializers
from .models import APIIntegration, APITemplate, APICallResult, IntegrationUsage, IntegrationAlert


class APIIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIIntegration
        fields = [
            'id', 'name', 'description', 'type', 'category', 'endpoint',
            'method', 'headers', 'authentication', 'parameters', 'rate_limit',
            'retry_policy', 'response_format', 'documentation', 'status',
            'last_used', 'success_rate', 'avg_response_time', 'created_at',
            'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_used', 'success_rate', 'avg_response_time']


class APITemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = APITemplate
        fields = [
            'id', 'name', 'description', 'category', 'provider', 'logo',
            'config_template', 'popularity', 'tags', 'is_public',
            'documentation_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'popularity']


class APICallResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = APICallResult
        fields = [
            'id', 'integration', 'request_data', 'response_data', 'status_code',
            'response_time', 'success', 'error_message', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class IntegrationUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationUsage
        fields = [
            'id', 'integration', 'total_calls', 'successful_calls', 'failed_calls',
            'avg_response_time', 'date'
        ]
        read_only_fields = ['id']


class IntegrationAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationAlert
        fields = [
            'id', 'integration', 'alert_type', 'message', 'threshold_value',
            'current_value', 'is_resolved', 'created_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at']