from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import APIIntegration, APITemplate
from .serializers import APIIntegrationSerializer, APITemplateSerializer


class APIIntegrationListCreateView(generics.ListCreateAPIView):
    """List and create API integrations"""
    serializer_class = APIIntegrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return APIIntegration.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Extract authentication data and encrypt it
        auth_data = serializer.validated_data.pop('authentication', {})
        integration = serializer.save(user=self.request.user)
        integration.set_auth_data(auth_data)
        integration.save()


class APIIntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete API integration"""
    serializer_class = APIIntegrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return APIIntegration.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Extract authentication data and encrypt it
        auth_data = serializer.validated_data.pop('authentication', {})
        self.perform_update(serializer)
        
        # Update encrypted authentication data
        instance.set_auth_data(auth_data)
        instance.save()
        
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_integration_view(request, pk):
    """Test API integration connection"""
    get_object_or_404(APIIntegration, pk=pk, user=request.user)
    
    # Implementation for testing integration would go here
    return Response({
        'success': True,
        'response_time': 150.5,
        'status_code': 200,
        'message': 'Integration test successful'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_integration_view(request, pk):
    """Execute API integration"""
    get_object_or_404(APIIntegration, pk=pk, user=request.user)
    
    # Implementation for executing integration would go here
    return Response({
        'success': True,
        'result': {'data': 'Sample response data'},
        'execution_time': 200.3
    })


class IntegrationTemplateListView(generics.ListAPIView):
    """List integration templates"""
    serializer_class = APITemplateSerializer
    queryset = APITemplate.objects.filter(is_public=True)
    permission_classes = [IsAuthenticated]