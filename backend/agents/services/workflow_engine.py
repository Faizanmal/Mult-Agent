# agents/services/workflow_engine.py

import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from django.utils import timezone
from django.db import transaction
from ..models import (
    Agent, Task, TaskStatus, TaskPriority, 
    WorkflowTemplate, Session, User
)
from .agent_selector import SmartAgentSelector
from .performance_tracker import PerformanceTracker

logger = logging.getLogger(__name__)

class WorkflowStep:
    """Represents a single step in a workflow."""
    
    def __init__(
        self, 
        step_id: str, 
        step_type: str, 
        config: Dict,
        dependencies: List[str] = None
    ):
        self.step_id = step_id
        self.step_type = step_type
        self.config = config
        self.dependencies = dependencies or []
        self.status = 'pending'
        self.result = None
        self.error = None
        self.start_time = None
        self.end_time = None

class WorkflowEngine:
    """
    Advanced workflow automation engine that orchestrates complex
    multi-agent workflows with dependency management, error handling,
    and performance optimization.
    """
    
    def __init__(self):
        self.agent_selector = SmartAgentSelector()
        self.performance_tracker = PerformanceTracker()
        self.step_executors = self._register_step_executors()
        self.running_workflows = {}
    
    async def execute_workflow(
        self, 
        workflow_definition: Dict, 
        input_data: Dict, 
        user_id: str, 
        session_id: str = None
    ) -> Dict:
        """
        Execute a complete workflow with dependency management and error handling.
        
        Args:
            workflow_definition: Workflow configuration and steps
            input_data: Initial data for the workflow
            user_id: User executing the workflow
            session_id: Optional session ID for context
            
        Returns:
            Workflow execution result with status and outputs
        """
        
        workflow_id = workflow_definition.get('id', f"workflow_{int(datetime.now().timestamp())}")
        
        try:
            logger.info(f"Starting workflow execution: {workflow_id}")
            
            # Parse workflow steps
            steps = self._parse_workflow_steps(workflow_definition)
            
            # Create workflow execution context
            context = {
                'workflow_id': workflow_id,
                'user_id': user_id,
                'session_id': session_id,
                'input_data': input_data,
                'steps': steps,
                'results': {},
                'start_time': timezone.now(),
                'status': 'running'
            }
            
            # Store running workflow
            self.running_workflows[workflow_id] = context
            
            # Execute workflow steps
            result = await self._execute_workflow_steps(context)
            
            # Update final status
            context['status'] = 'completed' if result['success'] else 'failed'
            context['end_time'] = timezone.now()
            
            logger.info(f"Workflow {workflow_id} completed: {context['status']}")
            
            return {
                'workflow_id': workflow_id,
                'success': result['success'],
                'results': context['results'],
                'execution_time': (context['end_time'] - context['start_time']).total_seconds(),
                'error': result.get('error'),
                'steps_executed': len([s for s in steps.values() if s.status == 'completed']),
                'total_steps': len(steps)
            }
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow_id}: {e}")
            return {
                'workflow_id': workflow_id,
                'success': False,
                'error': str(e),
                'results': {}
            }
        finally:
            # Clean up
            if workflow_id in self.running_workflows:
                del self.running_workflows[workflow_id]
    
    def _parse_workflow_steps(self, workflow_definition: Dict) -> Dict[str, WorkflowStep]:
        """Parse workflow definition into executable steps."""
        
        steps = {}
        workflow_steps = workflow_definition.get('steps', [])
        
        for step_config in workflow_steps:
            step = WorkflowStep(
                step_id=step_config['id'],
                step_type=step_config['type'],
                config=step_config.get('config', {}),
                dependencies=step_config.get('dependencies', [])
            )
            steps[step.step_id] = step
        
        return steps
    
    async def _execute_workflow_steps(self, context: Dict) -> Dict:
        """Execute workflow steps with dependency management."""
        
        steps = context['steps']
        results = context['results']
        
        try:
            # Build dependency graph
            dependency_graph = self._build_dependency_graph(steps)
            
            # Execute steps in topological order
            execution_order = self._topological_sort(dependency_graph)
            
            for step_id in execution_order:
                step = steps[step_id]
                
                try:
                    # Check if dependencies are satisfied
                    if not self._are_dependencies_satisfied(step, results):
                        step.status = 'skipped'
                        continue
                    
                    # Execute step
                    step.start_time = timezone.now()
                    step.status = 'running'
                    
                    logger.info(f"Executing step: {step_id} ({step.step_type})")
                    
                    step_result = await self._execute_step(step, context)
                    
                    step.end_time = timezone.now()
                    
                    if step_result['success']:
                        step.status = 'completed'
                        step.result = step_result['result']
                        results[step_id] = step.result
                    else:
                        step.status = 'failed'
                        step.error = step_result['error']
                        
                        # Check if this is a critical step
                        if step.config.get('critical', True):
                            return {
                                'success': False,
                                'error': f"Critical step {step_id} failed: {step.error}"
                            }
                        else:
                            logger.warning(f"Non-critical step {step_id} failed: {step.error}")
                
                except Exception as e:
                    step.status = 'failed'
                    step.error = str(e)
                    step.end_time = timezone.now()
                    
                    logger.error(f"Error executing step {step_id}: {e}")
                    
                    if step.config.get('critical', True):
                        return {
                            'success': False,
                            'error': f"Step {step_id} failed: {str(e)}"
                        }
            
            return {'success': True}
            
        except Exception as e:
            logger.error(f"Error in workflow execution: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _execute_step(self, step: WorkflowStep, context: Dict) -> Dict:
        """Execute a single workflow step."""
        
        executor = self.step_executors.get(step.step_type)
        if not executor:
            return {
                'success': False,
                'error': f"No executor found for step type: {step.step_type}"
            }
        
        try:
            result = await executor(step, context)
            return {
                'success': True,
                'result': result
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _register_step_executors(self) -> Dict[str, Callable]:
        """Register step executors for different step types."""
        
        return {
            'agent_task': self._execute_agent_task,
            'conditional': self._execute_conditional,
            'parallel': self._execute_parallel,
            'data_transform': self._execute_data_transform,
            'api_call': self._execute_api_call,
            'delay': self._execute_delay,
            'notification': self._execute_notification,
        }
    
    async def _execute_agent_task(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute a task using an agent."""
        
        config = step.config
        task_type = config.get('task_type', 'general')
        task_description = config.get('description', '')
        requirements = config.get('requirements', {})
        
        # Select best agent for the task
        agent = self.agent_selector.select_best_agent(
            task_type=task_type,
            task_description=task_description,
            requirements=requirements
        )
        
        if not agent:
            raise Exception(f"No suitable agent found for task type: {task_type}")
        
        # Prepare input data
        input_data = self._prepare_step_input(step, context)
        
        # Create and execute task
        with transaction.atomic():
            task = Task.objects.create(
                title=config.get('title', f"Workflow step: {step.step_id}"),
                description=task_description,
                task_type=task_type,
                priority=TaskPriority.NORMAL,
                assigned_agent=agent,
                created_by_id=context['user_id'],
                session_id=context['session_id'],
                requirements=requirements,
                input_data=input_data
            )
            
            # Execute the task (this would integrate with your agent execution system)
            # For now, we'll simulate the execution
            task_result = await self._simulate_agent_task_execution(agent, task)
            
            # Update task with results
            task.status = TaskStatus.COMPLETED if task_result['success'] else TaskStatus.FAILED
            task.completed_at = timezone.now()
            task.output_data = task_result.get('output', {})
            task.save()
            
            return task_result.get('output', {})
    
    async def _execute_conditional(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute conditional logic step."""
        
        config = step.config
        condition = config.get('condition', '')
        
        # Prepare condition evaluation context
        eval_context = {
            'results': context['results'],
            'input_data': context['input_data']
        }
        
        # Evaluate condition (simplified - in production, use a safer evaluation method)
        try:
            condition_result = eval(condition, {"__builtins__": {}}, eval_context)
            return {
                'condition_met': bool(condition_result),
                'condition': condition,
                'result': condition_result
            }
        except Exception as e:
            raise Exception(f"Error evaluating condition '{condition}': {e}")
    
    async def _execute_parallel(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute multiple sub-steps in parallel."""
        
        config = step.config
        sub_steps = config.get('steps', [])
        
        # Execute sub-steps in parallel
        tasks = []
        for sub_step_config in sub_steps:
            sub_step = WorkflowStep(
                step_id=f"{step.step_id}_{sub_step_config['id']}",
                step_type=sub_step_config['type'],
                config=sub_step_config.get('config', {})
            )
            
            task = asyncio.create_task(self._execute_step(sub_step, context))
            tasks.append((sub_step.step_id, task))
        
        # Wait for all tasks to complete
        results = {}
        for step_id, task in tasks:
            try:
                result = await task
                results[step_id] = result
            except Exception as e:
                results[step_id] = {'success': False, 'error': str(e)}
        
        return results
    
    async def _execute_data_transform(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute data transformation step."""
        
        config = step.config
        input_data = self._prepare_step_input(step, context)
        
        # Apply transformations
        transformations = config.get('transformations', [])
        result = input_data
        
        for transform in transformations:
            transform_type = transform.get('type')
            
            if transform_type == 'filter':
                # Filter data based on condition
                condition = transform.get('condition', 'True')
                if isinstance(result, list):
                    result = [item for item in result if eval(condition, {"__builtins__": {}}, {'item': item})]
            
            elif transform_type == 'map':
                # Transform each item
                expression = transform.get('expression', 'item')
                if isinstance(result, list):
                    result = [eval(expression, {"__builtins__": {}}, {'item': item}) for item in result]
            
            elif transform_type == 'aggregate':
                # Aggregate data
                operation = transform.get('operation', 'count')
                if operation == 'count':
                    result = len(result) if hasattr(result, '__len__') else 1
                elif operation == 'sum' and isinstance(result, list):
                    result = sum(result)
                elif operation == 'average' and isinstance(result, list):
                    result = sum(result) / len(result) if result else 0
        
        return result
    
    async def _execute_api_call(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute external API call."""
        
        import aiohttp
        
        config = step.config
        url = config.get('url', '')
        method = config.get('method', 'GET').upper()
        headers = config.get('headers', {})
        
        # Prepare request data
        input_data = self._prepare_step_input(step, context)
        
        async with aiohttp.ClientSession() as session:
            if method == 'GET':
                async with session.get(url, headers=headers, params=input_data) as response:
                    result = await response.json()
            else:
                async with session.request(method, url, headers=headers, json=input_data) as response:
                    result = await response.json()
        
        return result
    
    async def _execute_delay(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute delay/wait step."""
        
        config = step.config
        delay_seconds = config.get('seconds', 1)
        
        await asyncio.sleep(delay_seconds)
        
        return {
            'delayed_seconds': delay_seconds,
            'completed_at': timezone.now().isoformat()
        }
    
    async def _execute_notification(self, step: WorkflowStep, context: Dict) -> Any:
        """Execute notification step."""
        
        config = step.config
        message = config.get('message', 'Workflow notification')
        
        # Here you would integrate with your notification system
        # For now, we'll just log the notification
        logger.info(f"Workflow notification: {message}")
        
        return {
            'message': message,
            'sent_at': timezone.now().isoformat()
        }
    
    def _prepare_step_input(self, step: WorkflowStep, context: Dict) -> Dict:
        """Prepare input data for a step based on its configuration."""
        
        config = step.config
        input_mapping = config.get('input_mapping', {})
        
        step_input = {}
        
        # Map inputs from previous steps or initial data
        for key, source in input_mapping.items():
            if source.startswith('input.'):
                # Get from initial input data
                source_key = source[6:]  # Remove 'input.' prefix
                step_input[key] = context['input_data'].get(source_key)
            elif source.startswith('step.'):
                # Get from previous step result
                parts = source.split('.', 2)
                if len(parts) >= 2:
                    step_id = parts[1]
                    step_input[key] = context['results'].get(step_id, {})
                    if len(parts) == 3:
                        # Get specific field from step result
                        field = parts[2]
                        step_input[key] = step_input[key].get(field) if isinstance(step_input[key], dict) else None
            else:
                # Use literal value
                step_input[key] = source
        
        # If no input mapping specified, use all available data
        if not input_mapping:
            step_input = {
                'input_data': context['input_data'],
                'previous_results': context['results']
            }
        
        return step_input
    
    def _build_dependency_graph(self, steps: Dict[str, WorkflowStep]) -> Dict[str, List[str]]:
        """Build dependency graph for topological sorting."""
        
        graph = {}
        
        for step_id, step in steps.items():
            graph[step_id] = step.dependencies
        
        return graph
    
    def _topological_sort(self, graph: Dict[str, List[str]]) -> List[str]:
        """Perform topological sort to determine execution order."""
        
        from collections import deque, defaultdict
        
        # Calculate in-degrees
        in_degree = defaultdict(int)
        for node in graph:
            in_degree[node] = 0
        
        for node, dependencies in graph.items():
            for dep in dependencies:
                in_degree[node] += 1
        
        # Initialize queue with nodes having no dependencies
        queue = deque([node for node, degree in in_degree.items() if degree == 0])
        result = []
        
        while queue:
            node = queue.popleft()
            result.append(node)
            
            # Update in-degrees of dependent nodes
            for other_node, dependencies in graph.items():
                if node in dependencies:
                    in_degree[other_node] -= 1
                    if in_degree[other_node] == 0:
                        queue.append(other_node)
        
        # Check for cycles
        if len(result) != len(graph):
            raise Exception("Circular dependency detected in workflow")
        
        return result
    
    def _are_dependencies_satisfied(self, step: WorkflowStep, results: Dict) -> bool:
        """Check if all step dependencies are satisfied."""
        
        for dep_id in step.dependencies:
            if dep_id not in results:
                return False
        
        return True
    
    async def _simulate_agent_task_execution(self, agent: Agent, task: Task) -> Dict:
        """Simulate agent task execution (replace with actual agent integration)."""
        
        # Simulate processing time
        await asyncio.sleep(0.1)
        
        # Simulate success/failure based on agent capabilities
        success_probability = 0.9  # 90% success rate
        success = True  # For demo, always succeed
        
        if success:
            return {
                'success': True,
                'output': {
                    'agent_id': str(agent.id),
                    'agent_name': agent.name,
                    'task_type': task.task_type,
                    'processed_at': timezone.now().isoformat(),
                    'result': f"Task completed successfully by {agent.name}"
                }
            }
        else:
            return {
                'success': False,
                'error': "Simulated task failure"
            }
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict]:
        """Get current status of a running workflow."""
        
        return self.running_workflows.get(workflow_id)
    
    def cancel_workflow(self, workflow_id: str) -> bool:
        """Cancel a running workflow."""
        
        if workflow_id in self.running_workflows:
            context = self.running_workflows[workflow_id]
            context['status'] = 'cancelled'
            context['end_time'] = timezone.now()
            return True
        
        return False