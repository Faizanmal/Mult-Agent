# MCP Integration Serializers

from rest_framework import serializers
from .models import MCPTool, MCPSession, MCPToolExecution, MCPToolRegistry, MCPAgentToolBinding


class MCPToolSerializer(serializers.ModelSerializer):
    """Serializer for MCP tools."""
    
    class Meta:
        model = MCPTool
        fields = [
            'id', 'name', 'description', 'category', 'version',
            'parameters_schema', 'capabilities', 'requirements',
            'is_active', 'is_public', 'is_system_tool',
            'usage_count', 'success_rate', 'average_execution_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'success_rate', 'average_execution_time', 'created_at', 'updated_at']


class MCPSessionSerializer(serializers.ModelSerializer):
    """Serializer for MCP sessions."""
    
    class Meta:
        model = MCPSession
        fields = [
            'id', 'name', 'enabled_tools', 'context_data', 'configuration',
            'is_active', 'last_activity', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_activity', 'created_at', 'updated_at']


class MCPToolExecutionSerializer(serializers.ModelSerializer):
    """Serializer for MCP tool executions."""
    
    tool_name = serializers.CharField(source='tool.name', read_only=True)
    tool_category = serializers.CharField(source='tool.category', read_only=True)
    
    class Meta:
        model = MCPToolExecution
        fields = [
            'id', 'tool', 'tool_name', 'tool_category', 'session_id',
            'parameters', 'result', 'error_message',
            'success', 'execution_time', 'memory_usage',
            'agent_id', 'context_used', 'created_at'
        ]
        read_only_fields = ['id', 'tool_name', 'tool_category', 'created_at']


class MCPToolRegistrySerializer(serializers.ModelSerializer):
    """Serializer for MCP tool registries."""
    
    tools_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MCPToolRegistry
        fields = [
            'id', 'registry_name', 'description', 'version',
            'tools_config', 'default_settings', 'is_active',
            'tools_count', 'last_sync', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tools_count', 'created_at', 'updated_at']
    
    def get_tools_count(self, obj):
        """Get the number of tools in this registry."""
        return len(obj.tools_config.get('tools', []))


class MCPAgentToolBindingSerializer(serializers.ModelSerializer):
    """Serializer for agent-tool bindings."""
    
    tool_name = serializers.CharField(source='tool.name', read_only=True)
    tool_category = serializers.CharField(source='tool.category', read_only=True)
    
    class Meta:
        model = MCPAgentToolBinding
        fields = [
            'id', 'agent_id', 'tool', 'tool_name', 'tool_category',
            'is_preferred', 'priority', 'custom_parameters',
            'success_rate', 'average_execution_time', 'usage_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tool_name', 'tool_category', 'success_rate', 'average_execution_time', 'usage_count', 'created_at', 'updated_at']