"""
Advanced Workflow Orchestration with DAG Support
Directed Acyclic Graph based workflow execution with:
- Conditional branching
- Parallel execution
- Error handling and retry logic
- Workflow templates
- State management
"""
import asyncio
import logging
from typing import Dict, List, Any, Optional, Callable
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
import json
import uuid

logger = logging.getLogger(__name__)


class NodeStatus(Enum):
    """Workflow node execution status"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"
    RETRYING = "retrying"


class NodeType(Enum):
    """Types of workflow nodes"""
    TASK = "task"
    CONDITION = "condition"
    PARALLEL = "parallel"
    AGENT = "agent"
    API_CALL = "api_call"
    TRANSFORM = "transform"
    HUMAN_INPUT = "human_input"


@dataclass
class WorkflowNode:
    """
    Represents a node in the workflow DAG
    """
    id: str
    name: str
    type: NodeType
    action: Optional[Callable] = None
    condition: Optional[Callable] = None
    inputs: Dict[str, Any] = field(default_factory=dict)
    outputs: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    status: NodeStatus = NodeStatus.PENDING
    retry_count: int = 0
    max_retries: int = 3
    timeout: int = 300  # seconds
    metadata: Dict[str, Any] = field(default_factory=dict)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    error: Optional[str] = None
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
    
    def can_execute(self, completed_nodes: set) -> bool:
        """Check if node can be executed based on dependencies"""
        return all(dep in completed_nodes for dep in self.dependencies)
    
    def is_terminal(self) -> bool:
        """Check if node is in terminal state"""
        return self.status in [NodeStatus.SUCCESS, NodeStatus.FAILED, NodeStatus.SKIPPED]
    
    def to_dict(self) -> Dict:
        """Convert node to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type.value,
            'status': self.status.value,
            'inputs': self.inputs,
            'outputs': self.outputs,
            'dependencies': self.dependencies,
            'retry_count': self.retry_count,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'error': self.error,
            'metadata': self.metadata,
        }


class WorkflowDAG:
    """
    Directed Acyclic Graph for workflow representation
    """
    
    def __init__(self, workflow_id: str, name: str):
        self.workflow_id = workflow_id
        self.name = name
        self.nodes: Dict[str, WorkflowNode] = {}
        self.edges: Dict[str, List[str]] = {}  # node_id -> [dependent_node_ids]
        self.created_at = datetime.utcnow()
        self.context: Dict[str, Any] = {}
    
    def add_node(self, node: WorkflowNode) -> str:
        """Add node to DAG"""
        if node.id in self.nodes:
            raise ValueError(f"Node {node.id} already exists")
        
        self.nodes[node.id] = node
        self.edges[node.id] = []
        
        logger.info(f"Added node {node.id} ({node.name}) to workflow {self.workflow_id}")
        return node.id
    
    def add_edge(self, from_node_id: str, to_node_id: str):
        """Add edge between nodes (dependency)"""
        if from_node_id not in self.nodes:
            raise ValueError(f"Node {from_node_id} not found")
        if to_node_id not in self.nodes:
            raise ValueError(f"Node {to_node_id} not found")
        
        # Check for cycles
        if self._creates_cycle(from_node_id, to_node_id):
            raise ValueError("Adding this edge would create a cycle")
        
        self.edges[from_node_id].append(to_node_id)
        self.nodes[to_node_id].dependencies.append(from_node_id)
        
        logger.info(f"Added edge: {from_node_id} -> {to_node_id}")
    
    def _creates_cycle(self, from_node: str, to_node: str) -> bool:
        """Check if adding edge would create cycle"""
        visited = set()
        
        def dfs(node_id: str) -> bool:
            if node_id == from_node:
                return True
            if node_id in visited:
                return False
            
            visited.add(node_id)
            for next_node in self.edges.get(node_id, []):
                if dfs(next_node):
                    return True
            return False
        
        return dfs(to_node)
    
    def get_executable_nodes(self, completed_nodes: set) -> List[WorkflowNode]:
        """Get nodes that can be executed based on completed dependencies"""
        executable = []
        
        for node in self.nodes.values():
            if node.status == NodeStatus.PENDING and node.can_execute(completed_nodes):
                executable.append(node)
        
        return executable
    
    def get_start_nodes(self) -> List[WorkflowNode]:
        """Get nodes with no dependencies (entry points)"""
        return [node for node in self.nodes.values() if not node.dependencies]
    
    def to_dict(self) -> Dict:
        """Convert DAG to dictionary"""
        return {
            'workflow_id': self.workflow_id,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'nodes': {node_id: node.to_dict() for node_id, node in self.nodes.items()},
            'edges': self.edges,
            'context': self.context,
        }


class WorkflowEngine:
    """
    Workflow execution engine with DAG support
    """
    
    def __init__(self):
        self.active_workflows: Dict[str, WorkflowDAG] = {}
        self.execution_history: Dict[str, List[Dict]] = {}
    
    async def execute_workflow(self, dag: WorkflowDAG) -> Dict:
        """
        Execute workflow DAG
        
        Returns:
            Workflow execution result
        """
        self.active_workflows[dag.workflow_id] = dag
        
        logger.info(f"Starting workflow execution: {dag.workflow_id} ({dag.name})")
        
        completed_nodes = set()
        failed_nodes = set()
        
        try:
            # Get initial executable nodes
            executable_nodes = dag.get_start_nodes()
            
            while executable_nodes:
                # Execute nodes in parallel
                tasks = [
                    self._execute_node(dag, node)
                    for node in executable_nodes
                ]
                
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                for node, result in zip(executable_nodes, results):
                    if isinstance(result, Exception):
                        logger.error(f"Node {node.id} failed: {str(result)}")
                        failed_nodes.add(node.id)
                        node.status = NodeStatus.FAILED
                        node.error = str(result)
                    elif result:
                        completed_nodes.add(node.id)
                        node.status = NodeStatus.SUCCESS
                    else:
                        node.status = NodeStatus.SKIPPED
                
                # Get next executable nodes
                executable_nodes = dag.get_executable_nodes(completed_nodes)
                
                # Remove nodes that depend on failed nodes
                if failed_nodes:
                    executable_nodes = [
                        node for node in executable_nodes
                        if not any(dep in failed_nodes for dep in node.dependencies)
                    ]
            
            # Determine overall status
            all_nodes = set(dag.nodes.keys())
            if completed_nodes == all_nodes:
                status = "completed"
            elif failed_nodes:
                status = "failed"
            else:
                status = "partial"
            
            result = {
                'workflow_id': dag.workflow_id,
                'status': status,
                'completed_nodes': len(completed_nodes),
                'failed_nodes': len(failed_nodes),
                'total_nodes': len(all_nodes),
                'context': dag.context,
                'execution_summary': self._generate_summary(dag),
            }
            
            # Store in history
            self._store_execution_history(dag.workflow_id, result)
            
            logger.info(f"Workflow {dag.workflow_id} completed: {status}")
            
            return result
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            raise
        finally:
            # Cleanup
            if dag.workflow_id in self.active_workflows:
                del self.active_workflows[dag.workflow_id]
    
    async def _execute_node(self, dag: WorkflowDAG, node: WorkflowNode) -> bool:
        """
        Execute a single workflow node
        
        Returns:
            True if successful, False if skipped
        """
        node.status = NodeStatus.RUNNING
        node.start_time = datetime.utcnow()
        
        logger.info(f"Executing node {node.id} ({node.name})")
        
        try:
            # Handle different node types
            if node.type == NodeType.CONDITION:
                result = await self._execute_condition_node(dag, node)
            elif node.type == NodeType.PARALLEL:
                result = await self._execute_parallel_node(dag, node)
            elif node.type == NodeType.TASK:
                result = await self._execute_task_node(dag, node)
            elif node.type == NodeType.AGENT:
                result = await self._execute_agent_node(dag, node)
            else:
                result = await self._execute_generic_node(dag, node)
            
            node.end_time = datetime.utcnow()
            
            # Update context with outputs
            if node.outputs:
                dag.context.update(node.outputs)
            
            return result
            
        except Exception as e:
            logger.error(f"Node {node.id} execution failed: {str(e)}")
            node.error = str(e)
            node.end_time = datetime.utcnow()
            
            # Retry logic
            if node.retry_count < node.max_retries:
                node.retry_count += 1
                node.status = NodeStatus.RETRYING
                logger.info(f"Retrying node {node.id} (attempt {node.retry_count})")
                await asyncio.sleep(2 ** node.retry_count)  # Exponential backoff
                return await self._execute_node(dag, node)
            else:
                raise
    
    async def _execute_task_node(self, dag: WorkflowDAG, node: WorkflowNode) -> bool:
        """Execute task node"""
        if node.action:
            # Prepare inputs with context
            inputs = {**dag.context, **node.inputs}
            
            # Execute action
            if asyncio.iscoroutinefunction(node.action):
                result = await node.action(inputs)
            else:
                result = node.action(inputs)
            
            # Store outputs
            node.outputs = result if isinstance(result, dict) else {'result': result}
            return True
        
        return False
    
    async def _execute_condition_node(self, dag: WorkflowDAG, node: WorkflowNode) -> bool:
        """Execute conditional node"""
        if node.condition:
            inputs = {**dag.context, **node.inputs}
            
            if asyncio.iscoroutinefunction(node.condition):
                result = await node.condition(inputs)
            else:
                result = node.condition(inputs)
            
            node.outputs = {'condition_result': result}
            return bool(result)
        
        return True
    
    async def _execute_parallel_node(self, dag: WorkflowDAG, node: WorkflowNode) -> bool:
        """Execute parallel node (fan-out to multiple sub-tasks)"""
        # This is a placeholder for parallel execution logic
        # In practice, this would spawn multiple sub-workflows
        return True
    
    async def _execute_agent_node(self, dag: WorkflowDAG, node: WorkflowNode) -> bool:
        """Execute agent node"""
        # Placeholder for agent execution
        # Would integrate with agent system
        logger.info(f"Agent node {node.id}: {node.metadata.get('agent_type', 'unknown')}")
        return True
    
    async def _execute_generic_node(self, dag: WorkflowDAG, node: WorkflowNode) -> bool:
        """Execute generic node"""
        if node.action:
            return await self._execute_task_node(dag, node)
        return True
    
    def _generate_summary(self, dag: WorkflowDAG) -> Dict:
        """Generate execution summary"""
        summary = {
            'total_nodes': len(dag.nodes),
            'node_statuses': {},
            'total_duration': 0,
        }
        
        for status in NodeStatus:
            count = sum(1 for node in dag.nodes.values() if node.status == status)
            summary['node_statuses'][status.value] = count
        
        # Calculate total duration
        durations = []
        for node in dag.nodes.values():
            if node.start_time and node.end_time:
                duration = (node.end_time - node.start_time).total_seconds()
                durations.append(duration)
        
        if durations:
            summary['total_duration'] = sum(durations)
            summary['avg_node_duration'] = sum(durations) / len(durations)
        
        return summary
    
    def _store_execution_history(self, workflow_id: str, result: Dict):
        """Store workflow execution history"""
        if workflow_id not in self.execution_history:
            self.execution_history[workflow_id] = []
        
        result['executed_at'] = datetime.utcnow().isoformat()
        self.execution_history[workflow_id].append(result)
        
        # Keep only last 100 executions
        if len(self.execution_history[workflow_id]) > 100:
            self.execution_history[workflow_id] = self.execution_history[workflow_id][-100:]


# Global workflow engine instance
workflow_engine = WorkflowEngine()
