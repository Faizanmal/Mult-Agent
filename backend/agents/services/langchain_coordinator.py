import json
import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from django.conf import settings

from .. import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Agent, Session, Task, Message, TaskStatus, AgentStatus
from .groq_service import GroqService
from .enhanced_agent_coordinator import EnhancedAgentCoordinator

logger = logging.getLogger(__name__)

# Define tools for agent communication
@tool
def send_message_to_agent(agent_id: str, content: str, task_id: Optional[str] = None) -> Dict[str, Any]:
    """Send a message to another agent in the system"""
    try:
        from ..models import Agent
        # In a real implementation, this would send an actual message to the agent
        # For now, we'll just return a success response
        return {
            "status": "success",
            "message": f"Message sent to agent {agent_id}: {content}",
            "agent_id": agent_id,
            "task_id": task_id
        }
    except Exception as e:
        return {"error": f"Failed to send message: {str(e)}"}

@tool
def get_agent_status(agent_id: str) -> Dict[str, Any]:
    """Get the current status and capabilities of an agent"""
    try:
        from ..models import Agent
        try:
            from .. import models as agent_models
            agent = agent_models.Agent.objects.get(id=agent_id)
            return {
                "agent_id": str(agent.id),
                "name": agent.name,
                "type": agent.type,
                "status": agent.status,
                "capabilities": agent.capabilities or [],
                "is_active": agent.is_active
            }
        except Exception:
            return {"error": f"Agent with ID {agent_id} not found"}
    except Exception:
        return {"error": f"Agent with ID {agent_id} not found"}

@tool
def update_task_status(task_id: str, status: str, output: Optional[str] = None) -> Dict[str, Any]:
    """Update the status of a task"""
    try:
        from .. import models as agent_models
        task = agent_models.Task.objects.get(id=task_id)
        task.status = status
        if output:
            task.output_data = {"result": output}
        task.save()
        return {
            "task_id": str(task.id),
            "status": task.status,
            "updated_at": task.updated_at.isoformat() if hasattr(task, 'updated_at') else datetime.now().isoformat()
        }
    except Exception:
        return {"error": f"Task with ID {task_id} not found"}

@tool
def create_subtask(parent_task_id: str, title: str, description: str, assigned_agent_id: str) -> Dict[str, Any]:
    """Create a subtask for a parent task"""
    try:
        from .. import models as agent_models
        parent_task = agent_models.Task.objects.get(id=parent_task_id)
        subtask = agent_models.Task.objects.create(
            title=title,
            description=description,
            task_type="subtask",
            priority=parent_task.priority,
            status=agent_models.TaskStatus.PENDING,
            assigned_agent_id=assigned_agent_id,
            created_by=parent_task.created_by,
            session=parent_task.session,
            requirements=parent_task.requirements or {},
            input_data=parent_task.input_data or {}
        )
        return {
            "subtask_id": str(subtask.id),
            "parent_task_id": str(parent_task.id),
            "title": subtask.title,
            "status": subtask.status
        }
    except Exception as e:
        return {"error": f"Failed to create subtask: {str(e)}"}

@tool
def get_agent_performance(agent_id: str) -> Dict[str, Any]:
    """Get performance metrics for an agent"""
    try:
        from .. import models as agent_models
        agent = agent_models.Agent.objects.get(id=agent_id)
        # Get recent performance metrics
        recent_metrics = agent.metrics.all().order_by('-timestamp')[:5]
        metrics_data = [
            {
                "metric_name": metric.metric_name,
                "value": metric.metric_value,
                "timestamp": metric.timestamp.isoformat()
            }
            for metric in recent_metrics
        ]
        return {
            "agent_id": str(agent.id),
            "name": agent.name,
            "metrics": metrics_data
        }
    except Exception as e:
        return {"error": f"Failed to retrieve performance metrics: {str(e)}"}

@tool
def assign_task_to_agent(task_id: str, agent_id: str) -> Dict[str, Any]:
    """Assign a task to a specific agent"""
    try:
        from .. import models as agent_models
        task = agent_models.Task.objects.get(id=task_id)
        agent = agent_models.Agent.objects.get(id=agent_id)
        task.assigned_agent = agent
        task.status = agent_models.TaskStatus.PENDING
        task.save()
        return {
            "task_id": str(task.id),
            "assigned_agent": agent.name,
            "status": "assigned"
        }
    except Exception as e:
        return {"error": f"Failed to assign task: {str(e)}"}

@tool
def get_task_details(task_id: str) -> Dict[str, Any]:
    """Get detailed information about a task"""
    try:
        from .. import models as agent_models
        task = agent_models.Task.objects.get(id=task_id)
        return {
            "task_id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "assigned_agent": task.assigned_agent.name if task.assigned_agent else None,
            "created_at": task.created_at.isoformat(),
            "input_data": task.input_data or {}
        }
    except Exception as e:
        return {"error": f"Failed to get task details: {str(e)}"}

class LangchainAgentCoordinator:
    """
    Langchain-based coordinator for managing multi-agent workflows with enhanced collaboration.
    This coordinator implements defined agent roles, communication protocols, and decision-making processes.
    """
    
    def __init__(self, session: 'models.Session'):
        self.session = session
        self.groq_service = GroqService()
        self.enhanced_coordinator = EnhancedAgentCoordinator(session)
        api_key = settings.GROQ_API_KEY or None
        self.llm = ChatGroq(
            temperature=0.7,
            model=settings.GROQ_CONFIG.get('MODEL', 'mixtral-8x7b-32768'),
            api_key=api_key
        ) if api_key else None
        self.tools = [
            send_message_to_agent, 
            get_agent_status, 
            update_task_status, 
            create_subtask,
            get_agent_performance,
            assign_task_to_agent,
            get_task_details
        ]
        
    def process_message(self, message: 'models.Message') -> Dict[str, Any]:
        """
        Process incoming message using Langchain-based multi-agent coordination
        
        Args:
            message: The message to process
            
        Returns:
            Coordination results
        """
        logger.info(f"Processing message with Langchain coordinator: {message.id}")
        
        # Create a conversation history for context
        conversation_history = self._build_conversation_history(message)
        
        # Determine which agents should handle this message
        relevant_agents = self._determine_relevant_agents(message)
        
        # Create tasks for relevant agents
        tasks = []
        for agent in relevant_agents:
            task = self._create_agent_task(agent, message)
            tasks.append(task)
        
        # Use Langchain to orchestrate the workflow
        workflow_result = self._orchestrate_with_langchain(
            message, relevant_agents, tasks, conversation_history
        )
        
        # Send response back to session
        self._send_response_to_session(workflow_result, message)
        
        return {
            'message_id': str(message.id),
            'agents_involved': [agent.name for agent in relevant_agents],
            'tasks_created': len(tasks),
            'response': workflow_result
        }
    
    def _build_conversation_history(self, message: 'models.Message') -> List[Dict[str, Any]]:
        """Build conversation history from previous messages"""
        try:
            from .. import models as agent_models
            recent_messages = agent_models.Message.objects.filter(
                session=self.session
            ).order_by('-created_at')[:10]  # Last 10 messages
            
            history = []
            for msg in reversed(list(recent_messages)):  # Oldest first
                if hasattr(msg, 'sender_agent') and msg.sender_agent:
                    history.append(
                        HumanMessage(content=f"[{msg.sender_agent.name}]: {msg.content}")
                    )
                else:
                    history.append(
                        HumanMessage(content=msg.content)
                    )
            return history
        except Exception:
            return []
        
        return history
    
    def _determine_relevant_agents(self, message: Message) -> List[Agent]:
        """Determine which agents are relevant for processing the message"""
        # Use the enhanced coordinator's smart selection
        return self.enhanced_coordinator._determine_relevant_agents_enhanced(message)
    
    def _create_agent_task(self, agent: 'models.Agent', message: 'models.Message') -> 'models.Task':
        """Create a task for an agent to process a message"""
        return self.enhanced_coordinator._create_agent_task(agent, message)
    
    def _orchestrate_with_langchain(
        self, 
        message: 'models.Message', 
        agents: List['models.Agent'], 
        tasks: List['models.Task'],
        conversation_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Orchestrate agent workflow using Langchain with defined roles and protocols
        
        Args:
            message: The original message
            agents: List of agents to coordinate
            tasks: List of tasks to execute
            conversation_history: Previous conversation context
            
        Returns:
            Orchestration results
        """
        # Create a system prompt for the orchestrator with defined roles
        system_prompt = self._create_orchestrator_prompt_with_roles(agents, tasks)
        
        # Create the prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        # Create the agent executor
        try:
            if self.llm is None:
                logger.error("LLM not initialized due to missing API key")
                # Fallback to the enhanced coordinator
                return self.enhanced_coordinator.process_message(message)
            agent_executor = create_tool_calling_agent(self.llm, self.tools, prompt)
            executor = AgentExecutor(agent=agent_executor, tools=self.tools, verbose=True, handle_parsing_errors=True)
        except Exception as e:
            logger.error(f"Failed to create agent executor: {str(e)}")
            # Fallback to the enhanced coordinator
            return self.enhanced_coordinator.process_message(message)
        
        # Prepare input for the orchestrator
        agent_list = ", ".join([f"{agent.name} ({agent.type})" for agent in agents])
        task_list = ", ".join([f"{task.title}" for task in tasks])
        
        input_text = f"""
        Message to process: {message.content}
        Message type: {message.message_type}
        
        Available agents with their roles:
        {agent_list}
        
        Created tasks to coordinate:
        {task_list}
        
        Coordinate these agents following the defined communication protocols and decision-making processes.
        Use the tools to communicate between agents, manage tasks, and retrieve information.
        Provide a comprehensive, well-structured response that addresses the original message.
        """
        
        # Execute the workflow
        try:
            result = executor.invoke({
                "input": input_text,
                "chat_history": conversation_history
            })
            logger.info(f"Langchain orchestration completed successfully")
            
            return {
                "content": result["output"],
                "orchestrated": True,
                "method": "langchain_with_roles",
                "agents_coordinated": len(agents),
                "coordination_protocol": "role-based_with_tools"
            }
        except Exception as e:
            logger.error(f"Langchain orchestration failed: {str(e)}")
            # Fallback to enhanced coordinator
            return self.enhanced_coordinator.process_message(message)
    
    def _create_orchestrator_prompt_with_roles(self, agents: List['models.Agent'], tasks: List['models.Task']) -> str:
        """Create a system prompt for the Langchain orchestrator with defined agent roles"""
        # Define agent roles and responsibilities
        agent_roles = {
            "orchestrator": "Master coordinator that decomposes complex tasks, assigns work to specialists, and synthesizes final responses",
            "vision": "Specialist in visual analysis including image description, object detection, and OCR",
            "reasoning": "Expert in logical analysis, problem-solving, and critical thinking",
            "action": "Executor that performs actions, integrates with external systems, and carries out tasks",
            "memory": "Knowledge manager that stores, retrieves, and maintains context and historical information"
        }
        
        # Define communication protocols
        communication_protocols = """
        Communication Protocols:
        1. Always clearly identify the recipient agent when sending messages
        2. Provide complete context when delegating tasks
        3. Acknowledge receipt of messages and task assignments
        4. Report task completion with results
        5. Request clarification when requirements are unclear
        6. Escalate issues that cannot be resolved independently
        """
        
        # Define decision-making processes
        decision_processes = """
        Decision-Making Processes:
        1. Task Analysis: Analyze the complexity and requirements of incoming tasks
        2. Agent Selection: Choose the most suitable agents based on capabilities and performance history
        3. Task Decomposition: Break complex tasks into manageable subtasks when needed
        4. Parallel Processing: Execute independent subtasks concurrently for efficiency
        5. Sequential Processing: Execute dependent tasks in the correct order
        6. Result Validation: Review and validate results from specialized agents
        7. Conflict Resolution: Resolve discrepancies between agent outputs
        8. Confidence Scoring: Assess the reliability of agent responses
        9. Synthesis: Combine insights from multiple agents into a coherent response
        10. Quality Assurance: Ensure completeness and accuracy before finalizing
        11. Learning: Update agent performance metrics based on outcomes
        12. Escalation: Route complex issues to human supervisors when needed
        """
        
        agent_descriptions = []
        for agent in agents:
            agent_type_str = str(agent.type)
            role_description = agent_roles.get(agent_type_str, "Specialized assistant with specific capabilities")
            agent_type_display = agent_type_str
            capabilities_list = agent.capabilities if isinstance(agent.capabilities, list) else []
            capabilities_str = ', '.join(str(cap) for cap in capabilities_list)
            agent_descriptions.append(
                f"- {agent.name} ({agent_type_display}): {role_description}. Capabilities: {capabilities_str}"
            )
        
        task_descriptions = []
        for task in tasks:
            task_descriptions.append(
                f"- {task.title}: {task.description}"
            )
        
        return f"""
        You are an advanced Multi-Agent Orchestrator implementing a sophisticated coordination system.
        
        Agent Roles:
        {chr(10).join(agent_descriptions)}
        
        Communication Protocols:
        {communication_protocols}
        
        Decision-Making Processes:
        {decision_processes}
        
        Current Tasks:
        {chr(10).join(task_descriptions)}
        
        You have access to specialized tools for agent coordination:
        - send_message_to_agent: Communicate directly with specific agents
        - get_agent_status: Check availability and capabilities of agents
        - update_task_status: Track progress of assigned tasks
        - create_subtask: Break complex tasks into manageable subtasks
        - get_agent_performance: Evaluate agent capabilities based on historical performance
        - assign_task_to_agent: Delegate tasks to specific agents
        - get_task_details: Retrieve detailed information about tasks
        
        Your coordination workflow should follow these steps:
        1. Analyze the user request and identify required capabilities
        2. Select appropriate agents based on their roles and capabilities
        3. Decompose complex tasks into subtasks if needed
        4. Assign tasks to agents following the communication protocols
        5. Monitor progress and facilitate agent collaboration
        6. Synthesize results into a coherent, comprehensive response
        7. Ensure quality and completeness before responding to the user
        
        Always provide clear, structured responses that directly address the user's needs.
        Coordinate agents efficiently and ensure all relevant information is considered.
        """
    
    def _resolve_conflicts(self, agent_responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Resolve conflicts between agent responses using confidence scoring
        
        Args:
            agent_responses: List of responses from different agents
            
        Returns:
            Resolved response with highest confidence or synthesized response
        """
        if not agent_responses:
            return {"content": "No responses to resolve", "confidence": 0.0}
        
        # If only one response, return it
        if len(agent_responses) == 1:
            return agent_responses[0]
        
        # Calculate confidence scores for each response
        scored_responses = []
        for response in agent_responses:
            # Extract or calculate confidence (default to 0.5 if not provided)
            confidence = response.get("confidence", 0.5)
            # Adjust confidence based on agent performance
            agent_id = response.get("agent_id")
            if agent_id:
                try:
                    from .. import models as agent_models
                    agent = agent_models.Agent.objects.get(id=agent_id)
                    # Get recent performance metrics
                    recent_metrics = agent.metrics.filter(metric_name="accuracy").order_by('-timestamp')[:5]
                    if recent_metrics:
                        avg_accuracy = sum(m.metric_value for m in recent_metrics) / len(recent_metrics)
                        confidence = (confidence + avg_accuracy) / 2
                except Exception:
                    pass  # Use original confidence if we can't get agent metrics
            
            scored_responses.append({
                "response": response,
                "confidence": confidence
            })
        
        # Sort by confidence (highest first)
        scored_responses.sort(key=lambda x: x["confidence"], reverse=True)
        
        # If highest confidence is significantly higher than others, use it
        if len(scored_responses) >= 2 and scored_responses[0]["confidence"] > scored_responses[1]["confidence"] + 0.2:
            return scored_responses[0]["response"]
        
        # Otherwise, synthesize a combined response
        return self._synthesize_responses(scored_responses)
    
    def _synthesize_responses(self, scored_responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Synthesize multiple agent responses into a coherent response
        
        Args:
            scored_responses: List of responses with confidence scores
            
        Returns:
            Synthesized response
        """
        if not scored_responses:
            return {"content": "No responses to synthesize", "confidence": 0.0}
        
        # Weight responses by confidence
        total_confidence = sum(sr["confidence"] for sr in scored_responses)
        if total_confidence == 0:
            # Equal weighting if all confidences are zero
            weighted_content = "\n".join(sr["response"].get("content", "") for sr in scored_responses)
            return {"content": weighted_content, "confidence": 0.0}
        
        # Create weighted synthesis
        synthesis_parts = []
        for sr in scored_responses:
            weight = sr["confidence"] / total_confidence
            content = sr["response"].get("content", "")
            if content:
                synthesis_parts.append(f"[{weight:.2f} weight] {content}")
        
        synthesized_content = "\n\nSynthesized response:\n" + "\n".join(synthesis_parts)
        avg_confidence = total_confidence / len(scored_responses)
        
        return {
            "content": synthesized_content,
            "confidence": avg_confidence,
            "synthesized": True,
            "sources": len(scored_responses)
        }
    
    def _send_response_to_session(self, response: Dict[str, Any], original_message: Message):
        """Send response back to the session via WebSocket"""
        # Use the enhanced coordinator's method for consistency
        try:
            self.enhanced_coordinator._send_response_to_session(response, original_message)
        except Exception as e:
            logger.error(f"Failed to send response to session: {str(e)}")