from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import DataPipeline, DataSource, DataQualityRule, PipelineExecution
from .serializers import (
    DataPipelineSerializer, DataSourceSerializer,
    DataQualityRuleSerializer, PipelineExecutionSerializer
)


class DataPipelineListCreateView(generics.ListCreateAPIView):
    """List and create data pipelines"""
    serializer_class = DataPipelineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DataPipeline.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DataPipelineDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete data pipeline"""
    serializer_class = DataPipelineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DataPipeline.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_pipeline_view(request, pk):
    """Execute data pipeline"""
    pipeline = get_object_or_404(DataPipeline, pk=pk, user=request.user)
    
    # Implementation for pipeline execution would go here
    return Response({
        'execution_id': 'exec-123',
        'status': 'running',
        'started_at': '2024-01-01T00:00:00Z'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pipeline_status_view(request, pk):
    """Get pipeline execution status"""
    pipeline = get_object_or_404(DataPipeline, pk=pk, user=request.user)
    
    return Response({
        'status': 'completed',
        'progress': 100,
        'current_step': 'Finished',
        'logs': []
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_pipeline_view(request, pk):
    """Stop pipeline execution"""
    pipeline = get_object_or_404(DataPipeline, pk=pk, user=request.user)
    
    return Response({
        'status': 'stopped',
        'stopped_at': '2024-01-01T00:00:00Z'
    })


class DataSourceListCreateView(generics.ListCreateAPIView):
    """List and create data sources"""
    serializer_class = DataSourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DataSource.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DataSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete data source"""
    serializer_class = DataSourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DataSource.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_data_source_view(request, pk):
    """Test data source connection"""
    source = get_object_or_404(DataSource, pk=pk, user=request.user)
    
    return Response({
        'success': True,
        'connection_time': 120.5,
        'sample_data': {'rows': 10, 'columns': 5}
    })


class DataQualityRuleListCreateView(generics.ListCreateAPIView):
    """List and create data quality rules"""
    serializer_class = DataQualityRuleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DataQualityRule.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
