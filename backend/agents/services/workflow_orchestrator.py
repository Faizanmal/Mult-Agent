# backend/agents/services/workflow_orchestrator.py
"""
Advanced Workflow Orchestrator for Multi-Agent Coordination
Handles complex real-world workflows with dependency management,
parallel execution, error handling, and result aggregation.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Set, Callable
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field
from collections import defaultdict
import json

from django.utils import timezone
from django.db import transaction
from asgiref.sync import sync_to_async

from ..models import Agent, Task, TaskStatus, TaskPriority, Session
from .workflow_templates import WorkflowTemplates, get_template
from .groq_service import GroqService

logger = logging.getLogger(__name__)


class StepStatus(Enum):
    """Status of workflow steps"""
    PENDING = "pending"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    RETRYING = "retrying"


@dataclass
class WorkflowStep:
    """Represents a single step in a workflow"""
    id: str
    name: str
    type: str
    agent_type: str
    config: Dict[str, Any]
    dependencies: List[str] = field(default_factory=list)
    status: StepStatus = StepStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    retry_count: int = 0
    assigned_agent: Optional[Agent] = None
    task_id: Optional[str] = None
    outputs: List[str] = field(default_factory=list)


@dataclass
class WorkflowExecution:
    """Tracks the execution of a workflow"""
    workflow_id: str
    workflow_name: str
    user_id: str
    session_id: Optional[str]
    input_data: Dict[str, Any]
    steps: Dict[str, WorkflowStep]
    results: Dict[str, Any] = field(default_factory=dict)
    status: str = "initializing"
    start_time: datetime = field(default_factory=timezone.now)
    end_time: Optional[datetime] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class WorkflowOrchestrator:
    """
    Advanced orchestrator for multi-agent workflows.
    
    Features:
    - Dependency management and topological execution
    - Parallel step execution where possible
    - Intelligent agent selection and task assignment
    - Retry logic with exponential backoff
    - Result aggregation and context passing
    - Progress tracking and real-time updates
    """
    
    def __init__(self):
        self.groq_service = GroqService()
        self.active_workflows: Dict[str, WorkflowExecution] = {}
        self.step_executors = self._register_step_executors()
    
    async def execute_workflow(
        self,
        workflow_id: str,
        input_data: Dict[str, Any],
        user_id: str,
        session_id: Optional[str] = None,
        callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """
        Execute a complete workflow with intelligent orchestration.
        
        Args:
            workflow_id: ID of the workflow template to execute
            input_data: Input data for the workflow
            user_id: User executing the workflow
            session_id: Optional session for context
            callback: Optional callback for progress updates
            
        Returns:
            Workflow execution results
        """
        try:
            # Load workflow template
            template = get_template(workflow_id)
            if not template:
                raise ValueError(f"Workflow template '{workflow_id}' not found")
            
            # Create workflow execution
            execution_id = f"{workflow_id}_{int(datetime.now().timestamp())}"
            execution = self._create_workflow_execution(
                execution_id, template, input_data, user_id, session_id
            )
            
            self.active_workflows[execution_id] = execution
            logger.info(f"Starting workflow execution: {execution_id}")
            
            # Execute workflow steps
            await self._execute_workflow_steps(execution, callback)
            
            # Finalize execution
            execution.end_time = timezone.now()
            execution.status = "completed" if not execution.error else "failed"
            
            # Compile results
            result = self._compile_workflow_results(execution)
            
            logger.info(f"Workflow {execution_id} completed with status: {execution.status}")
            return result
            
        except Exception as e:
            logger.error(f"Error executing workflow: {e}", exc_info=True)
            if execution:
                execution.error = str(e)
                execution.status = "failed"
            raise
        finally:
            # Cleanup
            if execution_id in self.active_workflows:
                del self.active_workflows[execution_id]
    
    def _create_workflow_execution(
        self,
        execution_id: str,
        template: Dict,
        input_data: Dict,
        user_id: str,
        session_id: Optional[str]
    ) -> WorkflowExecution:
        """Create a workflow execution from template"""
        
        # Parse workflow steps
        steps = {}
        for step_config in template['steps']:
            step = WorkflowStep(
                id=step_config['id'],
                name=step_config['name'],
                type=step_config['type'],
                agent_type=step_config['agent_type'],
                config=step_config['config'],
                dependencies=step_config.get('dependencies', []),
                outputs=step_config.get('outputs', [])
            )
            steps[step.id] = step
        
        return WorkflowExecution(
            workflow_id=template['id'],
            workflow_name=template['name'],
            user_id=user_id,
            session_id=session_id,
            input_data=input_data,
            steps=steps,
            metadata={
                'template_category': template.get('category'),
                'description': template.get('description'),
                'error_handling': template.get('error_handling', {}),
                'success_criteria': template.get('success_criteria', {})
            }
        )
    
    async def _execute_workflow_steps(
        self,
        execution: WorkflowExecution,
        callback: Optional[Callable] = None
    ):
        """
        Execute workflow steps with dependency management and parallel execution.
        """
        execution.status = "running"
        
        # Build dependency graph
        dependency_graph = self._build_dependency_graph(execution.steps)
        
        # Execute steps in topological order with parallelism
        completed_steps: Set[str] = set()
        failed_steps: Set[str] = set()
        
        while len(completed_steps) + len(failed_steps) < len(execution.steps):
            # Find steps that are ready to execute
            ready_steps = self._get_ready_steps(
                execution.steps, completed_steps, failed_steps
            )
            
            if not ready_steps:
                # Check if we're stuck
                remaining_steps = set(execution.steps.keys()) - completed_steps - failed_steps
                if remaining_steps:
                    logger.warning(f"Workflow stuck with remaining steps: {remaining_steps}")
                    execution.error = "Workflow execution blocked by failed dependencies"
                break
            
            # Execute ready steps in parallel
            step_tasks = []
            for step_id in ready_steps:
                step = execution.steps[step_id]
                task = self._execute_step(step, execution, callback)
                step_tasks.append((step_id, task))
            
            # Wait for all parallel steps to complete
            for step_id, task in step_tasks:
                try:
                    await task
                    completed_steps.add(step_id)
                    logger.info(f"Step {step_id} completed successfully")
                except Exception as e:
                    logger.error(f"Step {step_id} failed: {e}")
                    failed_steps.add(step_id)
                    
                    # Handle based on error handling configuration
                    error_handling = execution.metadata.get('error_handling', {})
                    if not error_handling.get('retry_failed_steps', True):
                        # Stop on first failure if retries disabled
                        execution.error = f"Step {step_id} failed: {e}"
                        return
            
            # Send progress update
            if callback:
                await self._send_progress_update(execution, callback, completed_steps)
    
    async def _execute_step(
        self,
        step: WorkflowStep,
        execution: WorkflowExecution,
        callback: Optional[Callable] = None
    ):
        """Execute a single workflow step"""
        
        step.status = StepStatus.RUNNING
        step.start_time = timezone.now()
        
        try:
            logger.info(f"Executing step: {step.id} ({step.name})")
            
            # Select and assign agent
            agent = await self._select_agent_for_step(step, execution)
            step.assigned_agent = agent
            
            # Gather input context from dependencies
            context = self._gather_step_context(step, execution)
            
            # Execute the step based on type
            if step.type == 'agent_task':
                result = await self._execute_agent_task(step, agent, context, execution)
            else:
                raise ValueError(f"Unknown step type: {step.type}")
            
            # Store results
            step.result = result
            step.status = StepStatus.COMPLETED
            step.end_time = timezone.now()
            
            # Save outputs to execution context
            for output_key in step.outputs:
                if output_key in result:
                    execution.results[f"{step.id}.{output_key}"] = result[output_key]
            
            logger.info(f"Step {step.id} completed in {(step.end_time - step.start_time).total_seconds()}s")
            
        except Exception as e:
            step.error = str(e)
            step.status = StepStatus.FAILED
            step.end_time = timezone.now()
            
            # Retry logic
            error_handling = execution.metadata.get('error_handling', {})
            max_retries = error_handling.get('max_retries', 3)
            
            if step.retry_count < max_retries:
                step.retry_count += 1
                step.status = StepStatus.RETRYING
                logger.warning(f"Retrying step {step.id}, attempt {step.retry_count}/{max_retries}")
                
                # Exponential backoff
                await asyncio.sleep(2 ** step.retry_count)
                return await self._execute_step(step, execution, callback)
            else:
                logger.error(f"Step {step.id} failed after {max_retries} retries: {e}")
                raise
    
    async def _execute_agent_task(
        self,
        step: WorkflowStep,
        agent: Agent,
        context: Dict[str, Any],
        execution: WorkflowExecution
    ) -> Dict[str, Any]:
        """Execute a task using an AI agent"""
        
        # Build task prompt
        prompt = self._build_task_prompt(step, context, execution)
        
        # Create task in database
        task = await self._create_task(step, agent, execution, prompt)
        step.task_id = str(task.id)
        
        # Execute task using Groq
        try:
            response = await sync_to_async(self.groq_service.generate_response)(
                prompt,
                model=agent.configuration.get('model', 'llama3-8b-8192'),
                temperature=step.config.get('temperature', 0.7),
                max_tokens=step.config.get('max_tokens', 2000)
            )
            
            # Parse response
            result = self._parse_agent_response(response, step)
            
            # Update task
            await sync_to_async(self._update_task_completed)(task, result)
            
            return result
            
        except Exception as e:
            await sync_to_async(self._update_task_failed)(task, str(e))
            raise
    
    def _build_task_prompt(
        self,
        step: WorkflowStep,
        context: Dict[str, Any],
        execution: WorkflowExecution
    ) -> str:
        """Build a comprehensive prompt for the agent task"""
        
        prompt_parts = [
            f"# Task: {step.name}",
            f"\n## Objective",
            f"{step.config.get('task', 'Complete the assigned task')}",
            f"\n## Workflow Context",
            f"Workflow: {execution.workflow_name}",
            f"Input Data: {json.dumps(execution.input_data, indent=2)}",
        ]
        
        # Add dependency results as context
        if context:
            prompt_parts.append("\n## Previous Step Results")
            for key, value in context.items():
                prompt_parts.append(f"### {key}")
                prompt_parts.append(f"{json.dumps(value, indent=2)}")
        
        # Add specific instructions from config
        if 'instructions' in step.config:
            prompt_parts.append(f"\n## Specific Instructions")
            prompt_parts.append(step.config['instructions'])
        
        # Add expected outputs
        if step.outputs:
            prompt_parts.append(f"\n## Expected Outputs")
            prompt_parts.append(f"Please provide the following in your response:")
            for output in step.outputs:
                prompt_parts.append(f"- {output}")
        
        # Add output format
        prompt_parts.append("\n## Output Format")
        prompt_parts.append("Provide your response in JSON format with the expected outputs as keys.")
        
        return "\n".join(prompt_parts)
    
    def _parse_agent_response(self, response: str, step: WorkflowStep) -> Dict[str, Any]:
        """Parse agent response into structured result"""
        
        try:
            # Try to parse as JSON
            if '{' in response and '}' in response:
                json_start = response.index('{')
                json_end = response.rindex('}') + 1
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
            else:
                # Fallback: create result with raw response
                result = {
                    'response': response,
                    'raw_output': response
                }
            
            # Ensure all expected outputs are present
            for output_key in step.outputs:
                if output_key not in result:
                    result[output_key] = None
            
            return result
            
        except json.JSONDecodeError:
            # If JSON parsing fails, return raw response
            logger.warning(f"Could not parse JSON from agent response for step {step.id}")
            return {
                'response': response,
                'raw_output': response,
                'parse_error': 'Could not parse JSON'
            }
    
    async def _select_agent_for_step(
        self,
        step: WorkflowStep,
        execution: WorkflowExecution
    ) -> Agent:
        """Select the best agent for a workflow step"""
        
        # Query agents of the required type
        agents = await sync_to_async(list)(
            Agent.objects.filter(
                type=step.agent_type,
                is_active=True,
                owner_id=execution.user_id
            )
        )
        
        if not agents:
            # Create a default agent if none exists
            logger.warning(f"No agent found for type {step.agent_type}, creating default")
            agent = await sync_to_async(Agent.objects.create)(
                name=f"{step.agent_type.title()} Agent",
                type=step.agent_type,
                owner_id=execution.user_id,
                capabilities=step.config.get('capabilities_required', []),
                configuration={'model': 'llama3-8b-8192'}
            )
            return agent
        
        # Select agent based on capabilities match
        required_capabilities = set(step.config.get('capabilities_required', []))
        
        best_agent = None
        best_match = 0
        
        for agent in agents:
            agent_capabilities = set(agent.capabilities)
            match_count = len(required_capabilities & agent_capabilities)
            
            if match_count > best_match:
                best_match = match_count
                best_agent = agent
        
        # Use first available agent if no capability match
        return best_agent or agents[0]
    
    def _gather_step_context(
        self,
        step: WorkflowStep,
        execution: WorkflowExecution
    ) -> Dict[str, Any]:
        """Gather context from dependency step results"""
        
        context = {}
        
        for dep_id in step.dependencies:
            dep_step = execution.steps.get(dep_id)
            if dep_step and dep_step.result:
                context[dep_id] = dep_step.result
        
        return context
    
    def _build_dependency_graph(
        self,
        steps: Dict[str, WorkflowStep]
    ) -> Dict[str, Set[str]]:
        """Build dependency graph for topological execution"""
        
        graph = defaultdict(set)
        
        for step_id, step in steps.items():
            for dep_id in step.dependencies:
                graph[dep_id].add(step_id)
        
        return dict(graph)
    
    def _get_ready_steps(
        self,
        steps: Dict[str, WorkflowStep],
        completed: Set[str],
        failed: Set[str]
    ) -> List[str]:
        """Get steps that are ready to execute"""
        
        ready = []
        
        for step_id, step in steps.items():
            if step_id in completed or step_id in failed:
                continue
            
            # Check if all dependencies are completed
            deps_completed = all(dep_id in completed for dep_id in step.dependencies)
            
            if deps_completed:
                ready.append(step_id)
        
        return ready
    
    async def _create_task(
        self,
        step: WorkflowStep,
        agent: Agent,
        execution: WorkflowExecution,
        prompt: str
    ) -> Task:
        """Create a task record in the database"""
        
        session = None
        if execution.session_id:
            session = await sync_to_async(Session.objects.get)(id=execution.session_id)
        
        task = await sync_to_async(Task.objects.create)(
            name=step.name,
            description=f"Workflow: {execution.workflow_name}, Step: {step.id}",
            assigned_agent=agent,
            session=session,
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.MEDIUM,
            input_data={
                'workflow_id': execution.workflow_id,
                'step_id': step.id,
                'prompt': prompt,
                'config': step.config
            },
            started_at=timezone.now()
        )
        
        return task
    
    def _update_task_completed(self, task: Task, result: Dict):
        """Update task as completed"""
        task.status = TaskStatus.COMPLETED
        task.output_data = result
        task.completed_at = timezone.now()
        task.save()
    
    def _update_task_failed(self, task: Task, error: str):
        """Update task as failed"""
        task.status = TaskStatus.FAILED
        task.error_message = error
        task.completed_at = timezone.now()
        task.save()
    
    def _compile_workflow_results(
        self,
        execution: WorkflowExecution
    ) -> Dict[str, Any]:
        """Compile final workflow results"""
        
        completed_steps = [
            step for step in execution.steps.values()
            if step.status == StepStatus.COMPLETED
        ]
        
        failed_steps = [
            step for step in execution.steps.values()
            if step.status == StepStatus.FAILED
        ]
        
        execution_time = 0
        if execution.end_time:
            execution_time = (execution.end_time - execution.start_time).total_seconds()
        
        return {
            'workflow_id': execution.workflow_id,
            'workflow_name': execution.workflow_name,
            'status': execution.status,
            'success': execution.status == "completed",
            'execution_time': execution_time,
            'steps_completed': len(completed_steps),
            'steps_failed': len(failed_steps),
            'total_steps': len(execution.steps),
            'results': execution.results,
            'error': execution.error,
            'metadata': {
                'start_time': execution.start_time.isoformat(),
                'end_time': execution.end_time.isoformat() if execution.end_time else None,
                'input_data': execution.input_data,
            },
            'step_details': [
                {
                    'id': step.id,
                    'name': step.name,
                    'status': step.status.value,
                    'agent': step.assigned_agent.name if step.assigned_agent else None,
                    'execution_time': (
                        (step.end_time - step.start_time).total_seconds()
                        if step.end_time and step.start_time else 0
                    ),
                    'retry_count': step.retry_count,
                    'error': step.error
                }
                for step in execution.steps.values()
            ]
        }
    
    async def _send_progress_update(
        self,
        execution: WorkflowExecution,
        callback: Callable,
        completed_steps: Set[str]
    ):
        """Send progress update via callback"""
        
        progress = {
            'workflow_id': execution.workflow_id,
            'status': execution.status,
            'progress': len(completed_steps) / len(execution.steps) * 100,
            'completed_steps': len(completed_steps),
            'total_steps': len(execution.steps),
            'current_step': [
                step.name for step in execution.steps.values()
                if step.status == StepStatus.RUNNING
            ]
        }
        
        try:
            if asyncio.iscoroutinefunction(callback):
                await callback(progress)
            else:
                callback(progress)
        except Exception as e:
            logger.warning(f"Error sending progress update: {e}")
    
    def _register_step_executors(self) -> Dict[str, Callable]:
        """Register step executor functions"""
        return {
            'agent_task': self._execute_agent_task,
            # Add more step types as needed
        }
    
    def get_workflow_status(self, execution_id: str) -> Optional[Dict]:
        """Get current status of a workflow execution"""
        execution = self.active_workflows.get(execution_id)
        if not execution:
            return None
        
        return {
            'workflow_id': execution.workflow_id,
            'status': execution.status,
            'steps': {
                step_id: {
                    'name': step.name,
                    'status': step.status.value,
                    'progress': 100 if step.status == StepStatus.COMPLETED else 0
                }
                for step_id, step in execution.steps.items()
            }
        }
