from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Report, ReportTemplate, Dashboard, Widget
from .serializers import ReportSerializer, ReportTemplateSerializer, DashboardSerializer, WidgetSerializer


class ReportListCreateView(generics.ListCreateAPIView):
    """List and create reports"""
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete report"""
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report_view(request, pk):
    """Generate report"""
    report = get_object_or_404(Report, pk=pk, user=request.user)
    
    # Implementation for report generation would go here
    return Response({
        'report_data': {'charts': [], 'metrics': {}},
        'generated_at': '2024-01-01T00:00:00Z'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_report_view(request, pk):
    """Export report"""
    report = get_object_or_404(Report, pk=pk, user=request.user)
    
    # Implementation for report export would go here
    return Response({
        'download_url': 'https://example.com/report.pdf',
        'expires_at': '2024-01-02T00:00:00Z'
    })


class ReportTemplateListView(generics.ListAPIView):
    """List report templates"""
    serializer_class = ReportTemplateSerializer
    queryset = ReportTemplate.objects.filter(is_public=True)
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """Get dashboard data"""
    return Response({
        'widgets': [],
        'metadata': {'last_updated': '2024-01-01T00:00:00Z'}
    })


class WidgetListCreateView(generics.ListCreateAPIView):
    """List and create widgets"""
    serializer_class = WidgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Widget.objects.filter(dashboard__user=self.request.user)
