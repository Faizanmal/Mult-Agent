from typing import List, Dict, Any, Optional
import logging
import asyncio
from datetime import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from ..models import Agent, Session, Task, Message, TaskStatus, AgentStatus
from .groq_service import GroqService
from .vision_service import VisionService
from .audio_service import AudioService

logger = logging.getLogger(__name__)

class AgentCoordinator:
    """
    Central coordinator for managing multi-agent workflows and communication
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.groq_service = GroqService()
        self.vision_service = VisionService()
        self.audio_service = AudioService()
        self.active_agents = {}
        self.task_queue = []
        
    def process_message(self, message: Message) -> Dict[str, Any]:
        """
        Process incoming message and coordinate agent responses
        
        Args:
            message: The message to process
            
        Returns:
            Coordination results
        """
        logger.info(f"Processing message: {message.id}")
        
        # Determine which agents should handle this message
        relevant_agents = self._determine_relevant_agents(message)
        
        # Create tasks for relevant agents
        tasks = []
        for agent in relevant_agents:
            task = self._create_agent_task(agent, message)
            tasks.append(task)
        
        # Execute tasks in appropriate order
        results = self._execute_tasks(tasks)
        
        # Synthesize results from all agents
        final_response = self._synthesize_responses(results)
        
        # Send response back to session
        self._send_response_to_session(final_response, message)
        
        return {
            'message_id': str(message.id),
            'agents_involved': [agent.name for agent in relevant_agents],
            'tasks_created': len(tasks),
            'response': final_response
        }
    
    def process_multimodal_message(self, message: Message) -> Dict[str, Any]:
        """
        Process multimodal message with appropriate specialized agents
        
        Args:
            message: The multimodal message
            
        Returns:
            Processing results
        """
        logger.info(f"Processing multimodal message: {message.message_type}")
        
        results = {}
        
        # Process based on message type
        if message.message_type == 'image' and message.file_attachment:
            results['vision'] = self.vision_service.analyze_image(message.file_attachment.path)
            
        elif message.message_type == 'audio' and message.file_attachment:
            results['audio'] = self.audio_service.process_audio(message.file_attachment.path)
            
        elif message.message_type == 'text':
            results['text'] = self._process_text_message(message)
        
        # Use reasoning agent to combine insights
        reasoning_agent = self._get_agent_by_type('reasoning')
        if reasoning_agent:
            combined_analysis = self._get_combined_analysis(results, message.content)
            results['reasoning'] = combined_analysis
        
        # Generate final response
        orchestrator_agent = self._get_agent_by_type('orchestrator')
        if orchestrator_agent:
            final_response = self._orchestrate_final_response(results, message)
            results['final_response'] = final_response
        
        return results
    
    def execute_task(self, task: Task) -> Dict[str, Any]:
        """
        Execute a specific task with the assigned agent
        
        Args:
            task: The task to execute
            
        Returns:
            Execution results
        """
        logger.info(f"Executing task: {task.id}")
        
        agent = task.assigned_agent
        
        # Update task status
        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now()
        task.save()
        
        try:
            # Execute based on agent type
            if agent.type == 'orchestrator':
                result = self._execute_orchestrator_task(task)
            elif agent.type == 'vision':
                result = self._execute_vision_task(task)
            elif agent.type == 'reasoning':
                result = self._execute_reasoning_task(task)
            elif agent.type == 'action':
                result = self._execute_action_task(task)
            elif agent.type == 'memory':
                result = self._execute_memory_task(task)
            else:
                result = self._execute_generic_task(task)
            
            # Update task with results
            task.output_data = result
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            
        except Exception as e:
            logger.error(f"Task execution failed: {str(e)}")
            task.error_message = str(e)
            task.status = TaskStatus.FAILED
            task.completed_at = datetime.now()
            result = {'error': str(e)}
        
        task.save()
        
        # Notify via WebSocket
        self._notify_task_completion(task, result)
        
        return result
    
    def _determine_relevant_agents(self, message: Message) -> List[Agent]:
        """Determine which agents should process this message"""
        relevant_agents = []
        session_agents = self.session.agents.filter(is_active=True)
        
        # Always include orchestrator if available
        orchestrator = session_agents.filter(type='orchestrator').first()
        if orchestrator:
            relevant_agents.append(orchestrator)
        
        # Add specific agents based on message type
        if message.message_type == 'image':
            vision_agent = session_agents.filter(type='vision').first()
            if vision_agent:
                relevant_agents.append(vision_agent)
        
        elif message.message_type == 'audio':
            # Audio processing might need both vision and reasoning
            for agent_type in ['vision', 'reasoning']:
                agent = session_agents.filter(type=agent_type).first()
                if agent and agent not in relevant_agents:
                    relevant_agents.append(agent)
        
        # Always include reasoning agent for complex analysis
        reasoning_agent = session_agents.filter(type='reasoning').first()
        if reasoning_agent and reasoning_agent not in relevant_agents:
            relevant_agents.append(reasoning_agent)
        
        return relevant_agents
    
    def _create_agent_task(self, agent: Agent, message: Message) -> Task:
        """Create a task for an agent to process a message"""
        task = Task.objects.create(
            session=self.session,
            assigned_agent=agent,
            title=f"Process {message.message_type} message",
            description=f"Process message: {message.content[:100]}...",
            input_data={
                'message_id': str(message.id),
                'content': message.content,
                'message_type': message.message_type,
                'metadata': message.metadata,
                'file_path': message.file_attachment.path if message.file_attachment else None
            },
            priority=self._calculate_task_priority(agent, message)
        )
        
        return task
    
    def _execute_tasks(self, tasks: List[Task]) -> Dict[str, Any]:
        """Execute multiple tasks, handling dependencies"""
        results = {}
        
        # Sort tasks by priority
        sorted_tasks = sorted(tasks, key=lambda t: t.priority, reverse=True)
        
        for task in sorted_tasks:
            result = self.execute_task(task)
            results[str(task.id)] = result
            
            # Update agent status
            task.assigned_agent.status = AgentStatus.ACTIVE
            task.assigned_agent.save()
        
        return results
    
    def _synthesize_responses(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize responses from multiple agents"""
        orchestrator = self._get_agent_by_type('orchestrator')
        
        if not orchestrator:
            # Simple concatenation if no orchestrator
            return {
                'content': 'Multiple agents processed your request.',
                'agent_results': results,
                'synthesized': False
            }
        
        # Use orchestrator to synthesize
        synthesis_prompt = f"""
        Synthesize the following agent responses into a coherent, helpful response:
        
        Agent Results: {results}
        
        Provide a unified response that incorporates insights from all agents.
        """
        
        messages = [
            {"role": "system", "content": self.groq_service._get_orchestrator_prompt()},
            {"role": "user", "content": synthesis_prompt}
        ]
        
        synthesis = self.groq_service.chat_completion(messages)
        
        return {
            'content': synthesis.get('content', 'Error synthesizing responses'),
            'agent_results': results,
            'synthesized': True,
            'orchestrator': orchestrator.name
        }
    
    def _send_response_to_session(self, response: Dict[str, Any], original_message: Message):
        """Send response back to the session via WebSocket"""
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{self.session.id}",
            {
                "type": "agent_response",
                "response": response,
                "original_message_id": str(original_message.id),
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def _get_agent_by_type(self, agent_type: str) -> Optional[Agent]:
        """Get agent by type from session"""
        return self.session.agents.filter(type=agent_type, is_active=True).first()
    
    def _execute_orchestrator_task(self, task: Task) -> Dict[str, Any]:
        """Execute orchestrator-specific task"""
        input_data = task.input_data
        
        response = self.groq_service.generate_agent_response(
            'orchestrator',
            {'session_context': self.session.context},
            input_data.get('content', '')
        )
        
        return {
            'response': response,
            'agent_type': 'orchestrator',
            'coordination_actions': []
        }
    
    def _execute_vision_task(self, task: Task) -> Dict[str, Any]:
        """Execute vision-specific task"""
        input_data = task.input_data
        file_path = input_data.get('file_path')
        
        if file_path:
            vision_result = self.vision_service.analyze_image(file_path)
        else:
            vision_result = {'error': 'No image file provided'}
        
        # Enhance with Groq analysis
        groq_response = self.groq_service.generate_agent_response(
            'vision',
            {'vision_analysis': vision_result},
            input_data.get('content', 'Analyze this visual content')
        )
        
        return {
            'vision_analysis': vision_result,
            'groq_analysis': groq_response,
            'agent_type': 'vision'
        }
    
    def _execute_reasoning_task(self, task: Task) -> Dict[str, Any]:
        """Execute reasoning-specific task"""
        input_data = task.input_data
        
        response = self.groq_service.generate_agent_response(
            'reasoning',
            {
                'session_context': self.session.context,
                'task_context': input_data
            },
            input_data.get('content', '')
        )
        
        return {
            'reasoning_response': response,
            'agent_type': 'reasoning',
            'reasoning_steps': self._extract_reasoning_steps(response)
        }
    
    def _execute_action_task(self, task: Task) -> Dict[str, Any]:
        """Execute action-specific task"""
        input_data = task.input_data
        
        # This would integrate with MCP tools and external APIs
        response = self.groq_service.generate_agent_response(
            'action',
            {'available_tools': []},
            input_data.get('content', '')
        )
        
        return {
            'action_response': response,
            'agent_type': 'action',
            'actions_taken': []
        }
    
    def _execute_memory_task(self, task: Task) -> Dict[str, Any]:
        """Execute memory-specific task"""
        input_data = task.input_data
        
        # Store/retrieve from agent memory
        memory_operations = self._handle_memory_operations(task)
        
        response = self.groq_service.generate_agent_response(
            'memory',
            {'memory_context': memory_operations},
            input_data.get('content', '')
        )
        
        return {
            'memory_response': response,
            'agent_type': 'memory',
            'memory_operations': memory_operations
        }
    
    def _execute_generic_task(self, task: Task) -> Dict[str, Any]:
        """Execute generic task for custom agent types"""
        input_data = task.input_data
        
        response = self.groq_service.chat_completion([
            {"role": "user", "content": input_data.get('content', '')}
        ])
        
        return {
            'response': response,
            'agent_type': task.assigned_agent.type
        }
    
    def _calculate_task_priority(self, agent: Agent, message: Message) -> int:
        """Calculate task priority based on agent type and message"""
        base_priority = {
            'orchestrator': 10,
            'vision': 8,
            'reasoning': 7,
            'action': 6,
            'memory': 5
        }
        
        priority = base_priority.get(agent.type, 5)
        
        # Adjust based on message type
        if message.message_type == 'image' and agent.type == 'vision':
            priority += 2
        elif message.message_type == 'audio' and agent.type == 'vision':
            priority += 1
        
        return priority
    
    def _notify_task_completion(self, task: Task, result: Dict[str, Any]):
        """Notify about task completion via WebSocket"""
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{self.session.id}",
            {
                "type": "task_completed",
                "task_id": str(task.id),
                "agent_name": task.assigned_agent.name,
                "status": task.status,
                "result": result
            }
        )
    
    def _extract_reasoning_steps(self, response: Dict[str, Any]) -> List[str]:
        """Extract reasoning steps from response"""
        content = response.get('content', '')
        # Simple extraction - could be enhanced with NLP
        steps = [line.strip() for line in content.split('\n') if line.strip().startswith(('1.', '2.', '3.', '-', '*'))]
        return steps
    
    def _handle_memory_operations(self, task: Task) -> Dict[str, Any]:
        """Handle memory storage and retrieval operations"""
        # Placeholder for memory operations
        return {
            'stored_items': [],
            'retrieved_items': [],
            'memory_updates': []
        }
    
    def _process_text_message(self, message: Message) -> Dict[str, Any]:
        """Process text-only message"""
        return {
            'content': message.content,
            'analysis': 'Text message processed',
            'sentiment': 'neutral',  # Could be enhanced with sentiment analysis
            'entities': []  # Could be enhanced with NER
        }
    
    def _get_combined_analysis(self, results: Dict[str, Any], content: str) -> Dict[str, Any]:
        """Get combined analysis from reasoning agent"""
        reasoning_prompt = f"""
        Analyze and combine the following multimodal processing results:
        
        Results: {results}
        Original Content: {content}
        
        Provide comprehensive insights and actionable conclusions.
        """
        
        messages = [
            {"role": "system", "content": self.groq_service._get_reasoning_prompt()},
            {"role": "user", "content": reasoning_prompt}
        ]
        
        return self.groq_service.chat_completion(messages)
    
    def _orchestrate_final_response(self, results: Dict[str, Any], message: Message) -> Dict[str, Any]:
        """Orchestrate final response combining all analyses"""
        orchestration_prompt = f"""
        Create a comprehensive response based on the following multimodal analysis:
        
        Analysis Results: {results}
        Original Message: {message.content}
        Message Type: {message.message_type}
        
        Provide a helpful, actionable response that addresses the user's needs.
        """
        
        messages = [
            {"role": "system", "content": self.groq_service._get_orchestrator_prompt()},
            {"role": "user", "content": orchestration_prompt}
        ]
        
        return self.groq_service.chat_completion(messages)