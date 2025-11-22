from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings
from django.utils import timezone
from asgiref.sync import async_to_sync
import logging
import json

from .models import AIModelConfig, MultiModalSession, ModalityResult, CrossModalInsight
from agents.services.multimodal_processor import MultiModalProcessor
from agents.services.groq_service import GroqService

logger = logging.getLogger(__name__)

class AIModelConfigViewSet(viewsets.ViewSet):
    """Manage AI model configurations"""
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    
    def list(self, request):
        """List all AI model configurations"""
        try:
            model_type = request.query_params.get('model_type')
            is_active = request.query_params.get('is_active')
            
            queryset = AIModelConfig.objects.all()
            
            if model_type:
                queryset = queryset.filter(model_type=model_type)
            if is_active is not None:
                queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
            data = [{
                'id': str(config.id),
                'name': config.name,
                'model_type': config.model_type,
                'provider': config.provider,
                'model_id': config.model_id,
                'capabilities': config.capabilities,
                'is_active': config.is_active,
                'is_default': config.is_default,
            } for config in queryset[:50]]
            
            return Response({'models': data, 'count': len(data)})
        except Exception as e:
            logger.error(f"Error listing AI models: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request):
        """Create a new AI model configuration"""
        try:
            name = request.data.get('name')
            model_type = request.data.get('model_type')
            provider = request.data.get('provider')
            model_id = request.data.get('model_id')
            
            if not all([name, model_type, provider, model_id]):
                return Response(
                    {'error': 'name, model_type, provider, and model_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            config = AIModelConfig.objects.create(
                name=name,
                model_type=model_type,
                provider=provider,
                model_id=model_id,
                config=request.data.get('config', {}),
                capabilities=request.data.get('capabilities', []),
                created_by=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'id': str(config.id),
                'name': config.name,
                'message': 'AI model configuration created successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating AI model config: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MultiModalIntelligenceViewSet(viewsets.ViewSet):
    """Multi-modal intelligence processing"""
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.processor = MultiModalProcessor()
        self.groq_service = GroqService()
    
    @action(detail=False, methods=['post'])
    def process_multimodal(self, request):
        """Process multi-modal input with intelligence"""
        try:
            # Create session
            user = request.user if request.user.is_authenticated else None
            if not user:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            session_name = request.data.get('session_name', 'Multi-Modal Processing')
            session = MultiModalSession.objects.create(
                name=session_name,
                user=user,
                status='processing'
            )
            
            # Collect input data
            input_data = {}
            input_modalities = []
            
            if 'text' in request.data:
                input_data['text'] = request.data['text']
                input_modalities.append('text')
            
            for field_name in ['image', 'audio', 'video', 'document']:
                if field_name in request.FILES:
                    input_data[field_name] = request.FILES[field_name]
                    input_modalities.append(field_name)
            
            if not input_data:
                session.status = 'failed'
                session.save()
                return Response(
                    {'error': 'No input data provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            session.input_modalities = input_modalities
            session.save()
            
            # Process multi-modal input
            processing_options = request.data.get('processing_options', {})
            if isinstance(processing_options, str):
                processing_options = json.loads(processing_options)
            
            result = async_to_sync(self.processor.process_multimodal_input)(
                input_data=input_data,
                processing_options=processing_options
            )
            
            # Store results for each modality
            for modality_type, modality_result in result.get('results', {}).items():
                ModalityResult.objects.create(
                    session=session,
                    modality_type=modality_type,
                    output_data=modality_result,
                    confidence_score=modality_result.get('confidence', 0.0),
                    processing_time=result.get('processing_time', 0.0) / len(result.get('results', {}))
                )
            
            # Generate cross-modal insights
            if len(input_modalities) > 1:
                insights = self._generate_cross_modal_insights(
                    session, 
                    result.get('results', {}), 
                    input_modalities
                )
                result['cross_modal_insights'] = insights
            
            # Update session
            session.results = result
            session.status = 'completed'
            session.completed_at = timezone.now()
            session.save()
            
            return Response({
                'session_id': str(session.id),
                'results': result,
                'input_modalities': input_modalities,
                'status': 'completed'
            })
            
        except Exception as e:
            logger.error(f"Error in multi-modal processing: {e}")
            if 'session' in locals():
                session.status = 'failed'
                session.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def cross_modal_analysis(self, request):
        """Perform cross-modal analysis"""
        try:
            modality_results = request.data.get('modality_results', {})
            
            if len(modality_results) < 2:
                return Response(
                    {'error': 'At least 2 modalities required for cross-modal analysis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Analyze correlations
            insights = []
            modalities = list(modality_results.keys())
            
            for i, mod1 in enumerate(modalities):
                for mod2 in modalities[i+1:]:
                    insight = self._analyze_modality_pair(
                        mod1, 
                        modality_results[mod1],
                        mod2, 
                        modality_results[mod2]
                    )
                    insights.append(insight)
            
            return Response({
                'insights': insights,
                'analyzed_modalities': modalities,
                'insight_count': len(insights)
            })
            
        except Exception as e:
            logger.error(f"Error in cross-modal analysis: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def sessions(self, request):
        """List multi-modal sessions"""
        try:
            user = request.user if request.user.is_authenticated else None
            if not user:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            sessions = MultiModalSession.objects.filter(user=user)[:20]
            
            data = [{
                'id': str(session.id),
                'name': session.name,
                'status': session.status,
                'input_modalities': session.input_modalities,
                'created_at': session.created_at.isoformat(),
                'completed_at': session.completed_at.isoformat() if session.completed_at else None,
                'modality_count': session.modality_results.count(),
                'insights_count': session.cross_modal_insights.count(),
            } for session in sessions]
            
            return Response({'sessions': data, 'count': len(data)})
        except Exception as e:
            logger.error(f"Error listing sessions: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def session_detail(self, request, pk=None):
        """Get detailed information about a session"""
        try:
            session = MultiModalSession.objects.get(id=pk)
            
            if not request.user.is_authenticated or session.user != request.user:
                if not settings.DEBUG:
                    return Response(
                        {'error': 'Unauthorized'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            modality_results = [{
                'id': str(result.id),
                'modality_type': result.modality_type,
                'confidence_score': result.confidence_score,
                'processing_time': result.processing_time,
                'output_data': result.output_data,
            } for result in session.modality_results.all()]
            
            insights = [{
                'id': str(insight.id),
                'insight_type': insight.insight_type,
                'involved_modalities': insight.involved_modalities,
                'description': insight.description,
                'confidence': insight.confidence,
            } for insight in session.cross_modal_insights.all()]
            
            return Response({
                'id': str(session.id),
                'name': session.name,
                'status': session.status,
                'input_modalities': session.input_modalities,
                'results': session.results,
                'modality_results': modality_results,
                'cross_modal_insights': insights,
                'created_at': session.created_at.isoformat(),
            })
        except MultiModalSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching session detail: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_cross_modal_insights(self, session, results, modalities):
        """Generate insights from cross-modal analysis"""
        insights = []
        
        try:
            # Use AI to analyze relationships
            analysis_prompt = f"""
            Analyze the following multi-modal results and identify key insights:
            
            Modalities: {modalities}
            Results: {json.dumps(results, indent=2)}
            
            Identify:
            1. Correlations between different modalities
            2. Contradictions or inconsistencies
            3. Reinforcing evidence across modalities
            4. Unique insights from each modality
            
            Provide insights in a structured format.
            """
            
            ai_insights = self.groq_service.chat_completion([
                {"role": "user", "content": analysis_prompt}
            ])
            
            # Create insight record
            CrossModalInsight.objects.create(
                session=session,
                insight_type='ai_analysis',
                involved_modalities=modalities,
                description=ai_insights.get('content', 'AI analysis completed'),
                confidence=0.85,
                evidence=results
            )
            
            insights.append({
                'type': 'ai_analysis',
                'modalities': modalities,
                'description': ai_insights.get('content', ''),
                'confidence': 0.85
            })
            
        except Exception as e:
            logger.error(f"Error generating cross-modal insights: {e}")
        
        return insights
    
    def _analyze_modality_pair(self, mod1, result1, mod2, result2):
        """Analyze a pair of modalities for correlations"""
        return {
            'modalities': [mod1, mod2],
            'correlation_type': 'reinforcement',
            'confidence': 0.75,
            'description': f"Analysis of {mod1} and {mod2} modalities"
        }
