from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.utils import timezone
import logging

from .models import AgentCoordinationSession, AgentInteraction, CoordinationMetric
from agents.models import Agent, Session, Task
from agents.services.agent_coordinator import AgentCoordinator
from agents.services.workflow_orchestrator import WorkflowOrchestrator

logger = logging.getLogger(__name__)

class CoordinationSessionViewSet(viewsets.ViewSet):
    """Manage multi-agent coordination sessions"""
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orchestrator = WorkflowOrchestrator()
    
    def list(self, request):
        """List all coordination sessions"""
        try:
            user = request.user if not settings.DEBUG else None
            if user and user.is_authenticated:
                sessions = AgentCoordinationSession.objects.filter(user=user)
            else:
                sessions = AgentCoordinationSession.objects.all()[:20]
            
            data = [{
                'id': str(session.id),
                'name': session.name,
                'strategy': session.strategy,
                'is_active': session.is_active,
                'created_at': session.created_at.isoformat(),
                'interaction_count': session.interactions.count(),
                'metrics_count': session.metrics.count(),
            } for session in sessions]
            
            return Response({'sessions': data, 'count': len(data)})
        except Exception as e:
            logger.error(f"Error listing coordination sessions: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request):
        """Create a new coordination session"""
        try:
            name = request.data.get('name', 'New Coordination Session')
            strategy = request.data.get('strategy', 'sequential')
            config = request.data.get('config', {})
            
            user = request.user if request.user.is_authenticated else None
            if not user:
                return Response(
                    {'error': 'Authentication required'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            session = AgentCoordinationSession.objects.create(
                name=name,
                strategy=strategy,
                config=config,
                user=user
            )
            
            return Response({
                'id': str(session.id),
                'name': session.name,
                'strategy': session.strategy,
                'created_at': session.created_at.isoformat(),
                'message': 'Coordination session created successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating coordination session: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def coordinate_agents(self, request, pk=None):
        """Coordinate multiple agents for a task"""
        try:
            coordination_session = AgentCoordinationSession.objects.get(id=pk)
            
            agent_ids = request.data.get('agent_ids', [])
            task_description = request.data.get('task', '')
            strategy = request.data.get('strategy', coordination_session.strategy)
            
            if not agent_ids or not task_description:
                return Response(
                    {'error': 'agent_ids and task are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get agents
            agents = Agent.objects.filter(id__in=agent_ids, is_active=True)
            
            if agents.count() != len(agent_ids):
                return Response(
                    {'error': 'Some agents not found or inactive'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Execute coordination based on strategy
            if strategy == 'sequential':
                result = self._coordinate_sequential(coordination_session, agents, task_description)
            elif strategy == 'parallel':
                result = self._coordinate_parallel(coordination_session, agents, task_description)
            elif strategy == 'hierarchical':
                result = self._coordinate_hierarchical(coordination_session, agents, task_description)
            else:
                result = self._coordinate_collaborative(coordination_session, agents, task_description)
            
            return Response(result)
        except AgentCoordinationSession.DoesNotExist:
            return Response(
                {'error': 'Coordination session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error coordinating agents: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def interactions(self, request, pk=None):
        """Get interaction history for a coordination session"""
        try:
            coordination_session = AgentCoordinationSession.objects.get(id=pk)
            interactions = coordination_session.interactions.all()[:100]
            
            data = [{
                'id': str(interaction.id),
                'source_agent_id': str(interaction.source_agent_id),
                'target_agent_id': str(interaction.target_agent_id),
                'interaction_type': interaction.interaction_type,
                'content': interaction.content,
                'created_at': interaction.created_at.isoformat(),
                'processed': interaction.processed,
            } for interaction in interactions]
            
            return Response({'interactions': data, 'count': len(data)})
        except AgentCoordinationSession.DoesNotExist:
            return Response(
                {'error': 'Coordination session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching interactions: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        """Get metrics for a coordination session"""
        try:
            coordination_session = AgentCoordinationSession.objects.get(id=pk)
            metrics = coordination_session.metrics.all()[:50]
            
            data = [{
                'metric_name': metric.metric_name,
                'metric_value': metric.metric_value,
                'metadata': metric.metadata,
                'timestamp': metric.timestamp.isoformat(),
            } for metric in metrics]
            
            # Aggregate metrics
            aggregated = {}
            for metric in metrics:
                if metric.metric_name not in aggregated:
                    aggregated[metric.metric_name] = []
                aggregated[metric.metric_name].append(metric.metric_value)
            
            summary = {
                name: {
                    'avg': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'count': len(values)
                }
                for name, values in aggregated.items()
            }
            
            return Response({
                'metrics': data,
                'summary': summary,
                'count': len(data)
            })
        except AgentCoordinationSession.DoesNotExist:
            return Response(
                {'error': 'Coordination session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching metrics: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _coordinate_sequential(self, session, agents, task):
        """Execute agents sequentially"""
        results = []
        context = session.context.copy()
        
        for agent in agents:
            # Record interaction
            if results:
                prev_agent_id = results[-1]['agent_id']
                AgentInteraction.objects.create(
                    coordination_session=session,
                    source_agent_id=prev_agent_id,
                    target_agent_id=agent.id,
                    interaction_type='handoff',
                    content={'task': task, 'context': context}
                )
            
            # Execute agent task
            result = {
                'agent_id': str(agent.id),
                'agent_name': agent.name,
                'agent_type': agent.type,
                'output': f"Processed by {agent.name}",
                'timestamp': timezone.now().isoformat()
            }
            
            results.append(result)
            context['previous_results'] = results
        
        session.context = context
        session.save()
        
        return {
            'strategy': 'sequential',
            'results': results,
            'status': 'completed'
        }
    
    def _coordinate_parallel(self, session, agents, task):
        """Execute agents in parallel"""
        results = []
        
        for agent in agents:
            # Record broadcast interaction
            AgentInteraction.objects.create(
                coordination_session=session,
                source_agent_id=agents[0].id,  # First agent as coordinator
                target_agent_id=agent.id,
                interaction_type='broadcast',
                content={'task': task}
            )
            
            result = {
                'agent_id': str(agent.id),
                'agent_name': agent.name,
                'agent_type': agent.type,
                'output': f"Processed by {agent.name} in parallel",
                'timestamp': timezone.now().isoformat()
            }
            results.append(result)
        
        return {
            'strategy': 'parallel',
            'results': results,
            'status': 'completed'
        }
    
    def _coordinate_hierarchical(self, session, agents, task):
        """Execute agents hierarchically"""
        orchestrator = agents.filter(type='orchestrator').first()
        workers = agents.exclude(type='orchestrator')
        
        if not orchestrator:
            orchestrator = agents.first()
            workers = agents[1:]
        
        results = [{
            'agent_id': str(orchestrator.id),
            'agent_name': orchestrator.name,
            'role': 'orchestrator',
            'output': f"Orchestrated by {orchestrator.name}",
            'timestamp': timezone.now().isoformat()
        }]
        
        for worker in workers:
            AgentInteraction.objects.create(
                coordination_session=session,
                source_agent_id=orchestrator.id,
                target_agent_id=worker.id,
                interaction_type='request',
                content={'task': task}
            )
            
            results.append({
                'agent_id': str(worker.id),
                'agent_name': worker.name,
                'role': 'worker',
                'output': f"Executed by {worker.name}",
                'timestamp': timezone.now().isoformat()
            })
        
        return {
            'strategy': 'hierarchical',
            'results': results,
            'status': 'completed'
        }
    
    def _coordinate_collaborative(self, session, agents, task):
        """Execute agents collaboratively"""
        results = []
        
        # All agents contribute to shared context
        for agent in agents:
            for other_agent in agents:
                if agent.id != other_agent.id:
                    AgentInteraction.objects.create(
                        coordination_session=session,
                        source_agent_id=agent.id,
                        target_agent_id=other_agent.id,
                        interaction_type='collaborate',
                        content={'task': task}
                    )
            
            results.append({
                'agent_id': str(agent.id),
                'agent_name': agent.name,
                'agent_type': agent.type,
                'contribution': f"Collaborated by {agent.name}",
                'timestamp': timezone.now().isoformat()
            })
        
        return {
            'strategy': 'collaborative',
            'results': results,
            'status': 'completed'
        }
