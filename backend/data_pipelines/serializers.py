from rest_framework import serializers
from .models import DataPipeline, DataSource, DataQualityRule, PipelineExecution

class DataPipelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPipeline
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DataQualityRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataQualityRule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class PipelineExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineExecution
        fields = '__all__'
        read_only_fields = ['id', 'started_at', 'completed_at']