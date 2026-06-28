from typing import List, Dict, Any, Optional
import logging
import json
import re
from datetime import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from ..models import Agent, Session, Task, Message, TaskStatus, AgentStatus
from .groq_service import GroqService
from .vision_service import VisionService
from .audio_service import AudioService
from .rag_system import VectorDatabase, RAGSystem
from .agent_selector import SmartAgentSelector

logger = logging.getLogger(__name__)

# Module-level RAG singleton — initialised lazily so startup isn't blocked
_rag_system: Optional[RAGSystem] = None

def _get_rag_system() -> Optional[RAGSystem]:
    """Return the shared RAGSystem, initialising it once on first call."""
    global _rag_system
    if _rag_system is None:
        try:
            _rag_system = RAGSystem(VectorDatabase())
            logger.info("RAG system initialised")
        except Exception as e:
            logger.warning(f"RAG system unavailable: {e}")
    return _rag_system

class AgentCoordinator:
    """
    Central coordinator for managing multi-agent workflows and communication
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.groq_service = GroqService()
        self.vision_service = VisionService()
        self.audio_service = AudioService()
        self.agent_selector = SmartAgentSelector()
        self.active_agents = {}
        self.task_queue = []
        
    def process_message(self, message: Message) -> Dict[str, Any]:
        """
        Process incoming message and coordinate agent responses.
        Routes complex multi-step requests through the WorkflowOrchestrator (DAG),
        and uses the MultiModelOrchestrator for intelligent provider selection.
        """
        logger.info(f"Processing message: {message.id}")

        # ── Detect task complexity & choose execution path ───────────────────
        if self._is_complex_workflow(message.content):
            try:
                result = self._route_through_workflow_dag(message)
                if result:
                    self._send_response_to_session(result, message)
                    return {
                        'message_id': str(message.id),
                        'agents_involved': result.get('agents_involved', []),
                        'tasks_created': result.get('steps_executed', 0),
                        'response': result,
                        'routing': 'workflow_dag',
                    }
            except Exception as e:
                logger.warning(f"DAG routing failed, falling back to standard: {e}")

        # ── Standard multi-agent path ────────────────────────────────────────
        relevant_agents = self._determine_relevant_agents(message)

        tasks = []
        for agent in relevant_agents:
            task = self._create_agent_task(agent, message)
            tasks.append(task)

        results = self._execute_tasks(tasks)
        final_response = self._synthesize_responses(results)
        self._send_response_to_session(final_response, message)

        return {
            'message_id': str(message.id),
            'agents_involved': [agent.name for agent in relevant_agents],
            'tasks_created': len(tasks),
            'response': final_response,
            'routing': 'standard',
        }

    def _is_complex_workflow(self, content: str) -> bool:
        """
        Heuristic: decide if a message warrants multi-step DAG execution.
        Triggers for multi-step keywords, long requests, or explicit pipeline requests.
        """
        content_lower = content.lower()
        complex_signals = [
            'step by step', 'step-by-step', 'workflow', 'pipeline',
            'first.*then', 'analyze.*and then', 'compare.*and', 'generate.*and.*send',
            'research', 'plan and', 'create a report', 'multiple steps',
        ]
        if len(content) > 500:
            return True
        for signal in complex_signals:
            if re.search(signal, content_lower):
                return True
        return False

    def _route_through_workflow_dag(self, message: Message) -> Optional[Dict[str, Any]]:
        """
        Route a complex request through the WorkflowOrchestrator using an appropriate
        pre-built template. Maps message intent to the best matching template ID.
        """
        from .workflow_orchestrator import WorkflowOrchestrator
        import asyncio

        # ── Pick the best matching template ──────────────────────────────────
        template_id = self._select_workflow_template(message.content)
        if not template_id:
            return None

        user_id = str(self.session.user_id) if hasattr(self.session, 'user_id') else 'unknown'
        input_data = {
            'content': message.content,
            'message_type': message.message_type,
            'session_id': str(self.session.id),
            'message_id': str(message.id),
        }

        orchestrator = WorkflowOrchestrator()

        try:
            loop = asyncio.new_event_loop()
            try:
                result = loop.run_until_complete(
                    orchestrator.execute_workflow(
                        workflow_id=template_id,
                        input_data=input_data,
                        user_id=user_id,
                        session_id=str(self.session.id),
                    )
                )
            finally:
                loop.close()

            if result:
                result['routing'] = 'workflow_dag'
                result['template_used'] = template_id
            return result

        except Exception as e:
            logger.error(f"Workflow DAG execution error (template={template_id}): {e}")
            return None

    def _select_workflow_template(self, content: str) -> Optional[str]:
        """
        Map message content to the most appropriate workflow template ID.
        Returns None if no template is a good fit.
        """
        content_lower = content.lower()

        if any(w in content_lower for w in ['data', 'analys', 'dataset', 'csv', 'chart', 'graph']):
            return 'data_analysis_pipeline'
        if any(w in content_lower for w in ['research', 'summarize', 'summarise', 'literature']):
            return 'research_and_summarize'
        if any(w in content_lower for w in ['report', 'document', 'write up', 'generate doc']):
            return 'document_generation'
        if any(w in content_lower for w in ['code review', 'review code', 'pull request', 'pr review']):
            return 'code_review_process'
        if any(w in content_lower for w in ['bug', 'error', 'exception', 'crash', 'investigate']):
            return 'bug_investigation'
        if any(w in content_lower for w in ['support', 'ticket', 'complaint', 'help request']):
            return 'customer_support_ticket'
        if any(w in content_lower for w in ['content', 'blog', 'article', 'copy', 'marketing']):
            return 'content_creation_workflow'
        if any(w in content_lower for w in ['test', 'qa', 'quality', 'automated test']):
            return 'automated_testing'
        if any(w in content_lower for w in ['onboard', 'new user', 'setup', 'getting started']):
            return 'onboarding_automation'
        return None
    
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
        
        # ── Auto-trigger Reinforcement Learning update ──────────────────────
        self._trigger_rl_update(task, result)

        # Notify via WebSocket
        self._notify_task_completion(task, result)
        
        return result
    
    def _determine_relevant_agents(self, message: Message) -> List[Agent]:
        """
        Determine which agents should process this message.
        1. LLM decides which agent *types* are needed (JSON array).
        2. SmartAgentSelector picks the best *instance* per type (4-factor score).
        3. Falls back to keyword heuristics if LLM fails.
        """
        session_agents = self.session.agents.filter(is_active=True)

        # ── Step 1: LLM-driven type selection ───────────────────────────────
        needed_types: List[str] = []
        try:
            agent_descriptions = [f"{a.name} (type={a.type})" for a in session_agents]
            planning_messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a task router. Return ONLY a JSON array of agent types needed, "
                        "e.g. [\"orchestrator\",\"reasoning\"]. Always include 'orchestrator'. "
                        "Available types: orchestrator, vision, reasoning, action, memory."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Message: {message.content}\n"
                        f"Type: {message.message_type}\n"
                        f"Available agents: {', '.join(agent_descriptions)}"
                    ),
                },
            ]
            resp = self.groq_service.chat_completion(
                planning_messages, max_tokens=64, temperature=0.1
            )
            content = resp.get("content", "")
            match = re.search(r"\[.*?\]", content, re.DOTALL)
            if match:
                needed_types = json.loads(match.group())
        except Exception as e:
            logger.warning(f"LLM agent routing failed: {e}")

        # ── Step 2: SmartAgentSelector — pick best instance per type ────────
        relevant_agents: List[Agent] = []
        if needed_types:
            for agent_type in needed_types:
                candidates = list(session_agents.filter(type=agent_type))
                if not candidates:
                    continue
                if len(candidates) == 1:
                    relevant_agents.append(candidates[0])
                else:
                    try:
                        best = self.agent_selector.select_best_agent(
                            task_type=agent_type,
                            task_description=message.content[:200],
                            requirements={'message_type': message.message_type},
                            exclude_agents=[],
                        )
                        # Prefer selector's pick if it's in our candidate list,
                        # otherwise fall back to first candidate
                        if best and best in candidates:
                            relevant_agents.append(best)
                        else:
                            relevant_agents.append(candidates[0])
                    except Exception:
                        relevant_agents.append(candidates[0])
            if relevant_agents:
                return relevant_agents

        # ── Step 3: Keyword fallback ─────────────────────────────────────────
        relevant_agents = []
        orchestrator = session_agents.filter(type='orchestrator').first()
        if orchestrator:
            relevant_agents.append(orchestrator)

        if message.message_type == 'image':
            vision_agent = session_agents.filter(type='vision').first()
            if vision_agent:
                relevant_agents.append(vision_agent)
        elif message.message_type == 'audio':
            for agent_type in ['vision', 'reasoning']:
                agent = session_agents.filter(type=agent_type).first()
                if agent and agent not in relevant_agents:
                    relevant_agents.append(agent)

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
        """
        Synthesise responses from all agents.
        Uses MultiModelOrchestrator for intelligent provider selection
        (falls back to GroqService if unavailable).
        """
        orchestrator = self._get_agent_by_type('orchestrator')

        if not orchestrator:
            return {
                'content': 'Multiple agents processed your request.',
                'agent_results': results,
                'synthesized': False,
            }

        synthesis_prompt = (
            "You are the Orchestrator Agent. You have received the following outputs from "
            "specialist agents. Synthesise them into a single, well-structured, user-facing "
            "response. Do not just concatenate — reason about which parts are most important "
            "and integrate them coherently.\n\n"
            f"Agent outputs:\n{json.dumps(results, indent=2, default=str)}"
        )

        messages = [
            {"role": "system", "content": self.groq_service._get_orchestrator_prompt()},
            {"role": "user", "content": synthesis_prompt},
        ]

        # Try multi-model routing first
        synthesis = None
        model_used = 'groq_default'
        try:
            from Multi_model_Intelligence.services import MultiModelOrchestrator
            mm = MultiModelOrchestrator()
            synthesis = mm.chat_completion(messages, priority='quality')
            model_used = synthesis.get('model', 'multi_model')
        except Exception:
            pass

        if synthesis is None:
            synthesis = self.groq_service.chat_completion(messages)

        return {
            'content': synthesis.get('content', 'Error synthesizing responses'),
            'agent_results': results,
            'synthesized': True,
            'orchestrator': orchestrator.name,
            'model_used': model_used,
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
        """
        Execute orchestrator task using a real ReAct (Reason-Act-Observe) loop.
        The orchestrator LLM reasons about the goal, calls tools, observes results,
        and iterates until it reaches a final answer — instead of a single-shot call.
        """
        input_data = task.input_data
        user_content = input_data.get('content', '')
        session_context = self.session.context or {}

        # Fetch recent memory for context
        try:
            from ..models import AgentMemory
            memories = AgentMemory.objects.filter(session=self.session).order_by('-importance_score')[:5]
            memory_str = "\n".join(f"[{m.key}]: {str(m.value)[:120]}" for m in memories) or "(none)"
        except Exception:
            memory_str = "(unavailable)"

        # Available specialist agents
        session_agents = self.session.agents.filter(is_active=True)
        agent_list = ", ".join(
            f"{a.name}(type={a.type}, id={a.id})" for a in session_agents
        )

        # ── ReAct system prompt ──────────────────────────────────────────────
        react_system = (
            "You are an Orchestrator Agent running a ReAct (Reason + Act) loop.\n\n"
            "At each step you MUST produce EXACTLY one of:\n"
            "  Thought: <your reasoning about what to do next>\n"
            "  Action: <tool_name>\n"
            "  Action Input: <JSON arguments for the tool>\n"
            "OR, when you have enough information:\n"
            "  Final Answer: <your complete, well-formatted response to the user>\n\n"
            "Available tools:\n"
            "  execute_agent_task(agent_type, task_description, context_json) — run a specialist agent\n"
            "  search_memory(query, session_id, agent_id) — look up past knowledge\n"
            "  store_insight(key, value, session_id, importance) — save important findings\n"
            "  plan_task_decomposition(task_description, available_agents) — build a step plan\n\n"
            f"Available agents: {agent_list}\n"
            f"Recent memory:\n{memory_str}\n\n"
            "Rules:\n"
            "- Never skip the Thought step.\n"
            "- Always call at least plan_task_decomposition before delegating work.\n"
            "- Use execute_agent_task to get REAL responses from specialists.\n"
            "- Store key intermediate results with store_insight.\n"
            "- Produce Final Answer only after you have gathered enough information."
        )

        conversation: List[Dict[str, str]] = [
            {"role": "system", "content": react_system},
            {
                "role": "user",
                "content": (
                    f"Session context: {json.dumps(session_context)}\n\n"
                    f"User request: {user_content}"
                ),
            },
        ]

        # ── Simple tool execution map ────────────────────────────────────────
        def _execute_tool(tool_name: str, tool_input: Dict) -> str:
            try:
                if tool_name == "execute_agent_task":
                    from .langchain_coordinator import _invoke_agent_via_groq
                    agent_type = tool_input.get("agent_type", "reasoning")
                    task_desc = tool_input.get("task_description", "")
                    ctx = json.dumps(tool_input.get("context_json", {}))
                    result = _invoke_agent_via_groq(agent_type, task_desc, ctx)
                    return json.dumps({"status": "success", "agent_type": agent_type, "result": result})

                elif tool_name == "search_memory":
                    from ..models import AgentMemory
                    query = tool_input.get("query", "")
                    filters: Dict[str, Any] = {}
                    if tool_input.get("session_id"):
                        filters["session_id"] = tool_input["session_id"]
                    mems = AgentMemory.objects.filter(
                        session=self.session, **filters
                    ).order_by("-importance_score")[:10]
                    words = set(query.lower().split())
                    scored = sorted(
                        [(sum(1 for w in words if w in str(m.value).lower()), m) for m in mems],
                        key=lambda x: x[0], reverse=True
                    )
                    hits = [{"key": m.key, "value": m.value} for _, m in scored[:5]]
                    return json.dumps({"status": "success", "memories": hits})

                elif tool_name == "store_insight":
                    from ..models import AgentMemory
                    AgentMemory.objects.create(
                        session=self.session,
                        key=tool_input.get("key", f"insight_{datetime.now().strftime('%H%M%S')}"),
                        value={"content": tool_input.get("value", ""), "ts": datetime.now().isoformat()},
                        importance_score=float(tool_input.get("importance", 0.7)),
                    )
                    return json.dumps({"status": "success"})

                elif tool_name == "plan_task_decomposition":
                    from .langchain_coordinator import plan_task_decomposition
                    r = plan_task_decomposition.invoke({
                        "task_description": tool_input.get("task_description", ""),
                        "available_agents": tool_input.get("available_agents", agent_list),
                    })
                    return json.dumps(r)

                else:
                    return json.dumps({"error": f"Unknown tool: {tool_name}"})
            except Exception as e:
                return json.dumps({"error": str(e)})

        # ── ReAct loop ───────────────────────────────────────────────────────
        max_steps = 10
        steps_taken = []
        final_answer = None

        for step in range(max_steps):
            llm_resp = self.groq_service.chat_completion(
                conversation, max_tokens=1024, temperature=0.7
            )
            raw = llm_resp.get('content', '') or ''
            conversation.append({"role": "assistant", "content": raw})
            logger.debug(f"[ReAct step {step+1}]\n{raw}")

            # ── Parse Final Answer ───────────────────────────────────────────
            if "Final Answer:" in raw:
                final_answer = raw.split("Final Answer:", 1)[1].strip()
                break

            # ── Parse Action + Action Input ──────────────────────────────────
            action_match = re.search(r"Action:\s*(.+)", raw)
            input_match = re.search(r"Action Input:\s*(\{.*?\}|\[.*?\])", raw, re.DOTALL)

            if action_match:
                tool_name = action_match.group(1).strip()
                try:
                    tool_args = json.loads(input_match.group(1)) if input_match else {}
                except json.JSONDecodeError:
                    tool_args = {}

                observation = _execute_tool(tool_name, tool_args)
                steps_taken.append({
                    "step": step + 1,
                    "tool": tool_name,
                    "input": tool_args,
                    "observation": observation[:400],
                })
                conversation.append({
                    "role": "user",
                    "content": f"Observation: {observation}",
                })
            else:
                # No action found — the LLM may already be concluding
                if raw.strip():
                    final_answer = raw.strip()
                break

        if not final_answer:
            final_answer = conversation[-1].get("content", "Task completed.")

        return {
            "response": {"content": final_answer},
            "agent_type": "orchestrator",
            "react_steps": len(steps_taken),
            "coordination_actions": steps_taken,
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
        """Execute reasoning task with RAG retrieval, memory, and chain-of-thought."""
        input_data = task.input_data
        agent = task.assigned_agent
        query = input_data.get('content', '')

        # ── RAG: retrieve relevant documents ─────────────────────────────────
        rag_context = ""
        rag_sources: List[Dict] = []
        rag = _get_rag_system()
        if rag:
            try:
                rag_context = rag.retrieve_context(query, top_k=3)
                source_docs = rag.vector_db.search(query, top_k=3)
                rag_sources = [{'id': d['id'], 'snippet': d['text'][:150]} for d in source_docs]
            except Exception as e:
                logger.debug(f"RAG retrieval failed: {e}")

        # ── Memory: retrieve relevant memories ──────────────────────────────
        relevant_memories = self._get_relevant_memories(agent, query)
        memory_ctx = [
            {"key": m.key, "value": m.value, "importance": float(m.importance_score)}
            for m in relevant_memories
        ]

        # ── Multi-turn reasoning: plan then execute ──────────────────────────
        planning_msgs: List[Dict] = [
            {"role": "system", "content": self.groq_service._get_reasoning_prompt()},
            {
                "role": "user",
                "content": (
                    f"Retrieved knowledge:\n{rag_context}\n\n"
                    f"Prior memory context:\n{json.dumps(memory_ctx)}\n\n"
                    f"Task: {query}\n\n"
                    "First, outline a step-by-step reasoning plan (numbered list). "
                    "Be explicit about each inference step."
                ),
            },
        ]
        plan_response = self.groq_service.chat_completion(planning_msgs)
        plan_text = plan_response.get('content', '')

        execution_msgs = planning_msgs + [
            {"role": "assistant", "content": plan_text},
            {"role": "user", "content": "Now execute your plan and provide the final reasoned answer."},
        ]
        response = self.groq_service.chat_completion(execution_msgs)

        # Store new reasoning insight in memory
        self._store_reasoning_memory(agent, response)

        return {
            'reasoning_plan': plan_text,
            'reasoning_response': response,
            'agent_type': 'reasoning',
            'reasoning_steps': self._extract_reasoning_steps(response),
            'memories_used': len(relevant_memories),
            'rag_sources': rag_sources,
            'rag_context_used': bool(rag_context),
        }

    def _execute_action_task(self, task: Task) -> Dict[str, Any]:
        """
        Execute action task:
        1. Ask the Action LLM to identify which installed plugin (if any) fits the task.
        2. Execute that plugin via the sandboxed PluginService.
        3. Feed plugin output back to LLM for a final action report.
        """
        input_data = task.input_data
        query = input_data.get('content', '')

        # ── Discover installed plugins for this session/user ─────────────────
        plugin_descriptions: List[Dict] = []
        plugin_map: Dict[str, Any] = {}  # name → installation object
        try:
            from ..plugin_models import PluginInstallation
            task.assigned_agent
            installations = PluginInstallation.objects.filter(
                is_enabled=True
            ).select_related('plugin')[:20]
            for inst in installations:
                desc = {
                    'name': inst.plugin.name,
                    'description': inst.plugin.description,
                    'category': inst.plugin.category,
                }
                plugin_descriptions.append(desc)
                plugin_map[inst.plugin.name] = inst
        except Exception as e:
            logger.debug(f"Plugin discovery failed: {e}")

        # ── Ask LLM which plugin to use (if any) ────────────────────────────
        action_msgs: List[Dict] = [
            {"role": "system", "content": self.groq_service._get_action_prompt()},
            {
                "role": "user",
                "content": (
                    f"Task: {query}\n\n"
                    f"Available plugins:\n{json.dumps(plugin_descriptions, indent=2)}\n\n"
                    "If a plugin is suitable, respond with JSON: "
                    "{\"use_plugin\": \"<name>\", \"input\": {<key:value>}}\n"
                    "If no plugin fits, respond with JSON: {\"use_plugin\": null, \"steps\": [\"...\"]}"
                ),
            },
        ]
        action_response = self.groq_service.chat_completion(action_msgs, temperature=0.2, max_tokens=256)
        action_text = action_response.get('content', '') or ''

        plugin_result = None
        plugin_name_used = None
        try:
            match = re.search(r'\{.*\}', action_text, re.DOTALL)
            if match:
                decision = json.loads(match.group())
                chosen = decision.get('use_plugin')
                if chosen and chosen in plugin_map:
                    from .plugin_service import PluginService
                    success, plugin_result, err = PluginService.execute_plugin(
                        plugin_map[chosen],
                        input_data=decision.get('input', {'task': query}),
                        execution_context={'session_id': str(self.session.id)},
                    )
                    plugin_name_used = chosen
                    if not success:
                        logger.warning(f"Plugin '{chosen}' failed: {err}")
                        plugin_result = {'error': err}
        except Exception as e:
            logger.debug(f"Plugin execution error: {e}")

        # ── Final action report with plugin output (if any) ─────────────────
        report_msgs = action_msgs + [
            {"role": "assistant", "content": action_text},
            {
                "role": "user",
                "content": (
                    f"Plugin execution result: {json.dumps(plugin_result, default=str)}\n\n"
                    "Provide a concise action report: what was done and the outcome."
                ) if plugin_result else "No plugin was executed. Describe what actions you would take step by step.",
            },
        ]
        final_response = self.groq_service.chat_completion(report_msgs)

        actions = [
            line.strip()
            for line in (final_response.get('content', '') or '').split('\n')
            if line.strip() and line.strip()[0].isdigit()
        ]

        return {
            'action_response': final_response,
            'agent_type': 'action',
            'actions_taken': actions,
            'plugin_used': plugin_name_used,
            'plugin_result': plugin_result,
            'plugins_available': len(plugin_descriptions),
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

    def _trigger_rl_update(self, task: Task, result: Dict[str, Any]):
        """
        Auto-trigger Q-learning update after every task completion.
        Feeds the outcome back into the agent's learning profile so the
        system actually improves its decision-making over time.
        """
        try:
            from agent_learning.models import AgentLearningProfile, ReinforcementState
            from agent_learning.services import RLEngine

            agent = task.assigned_agent
            success = task.status == TaskStatus.COMPLETED

            # Get or create learning profile for this agent (FK = agent instance)
            profile, _ = AgentLearningProfile.objects.get_or_create(
                agent=agent,
                defaults={
                    'algorithm': 'q_learning',
                    'learning_rate': 0.1,
                    'discount_factor': 0.95,
                    'total_tasks_completed': 0,
                    'success_rate': 0.5,
                },
            )

            # Increment task counter
            profile.total_tasks_completed += 1
            profile.save(update_fields=['total_tasks_completed'])

            # Build state representation
            state = {
                'agent_type': agent.type,
                'task_type': getattr(task, 'task_type', 'generic'),
                'session_id': str(self.session.id),
            }
            action = {'task_id': str(task.id), 'agent_type': agent.type}
            reward = 1.0 if success else -0.5
            task_type = getattr(task, 'task_type', None) or agent.type or 'generic'

            # Create a reinforcement state record (field is state_representation)
            rl_state = ReinforcementState.objects.create(
                learning_profile=profile,
                session=self.session,
                state_representation=state,
                action_taken=action,
                reward=reward,
                next_state={},
                success=success,
                q_value=0.0,
                expected_q_value=0.0,
                task_type=task_type,
            )

            # Run Q-learning update
            engine = RLEngine(profile)
            new_q = engine.update_q_values(rl_state)
            logger.info(f"RL update: agent={agent.name}, success={success}, new_q={new_q:.3f}")

        except Exception as e:
            logger.debug(f"RL update skipped: {e}")
    
    def _extract_reasoning_steps(self, response: Dict[str, Any]) -> List[str]:
        """Extract reasoning steps from response"""
        content = response.get('content', '')
        # Simple extraction - could be enhanced with NLP
        steps = [line.strip() for line in content.split('\n') if line.strip().startswith(('1.', '2.', '3.', '-', '*'))]
        return steps
    
    def _handle_memory_operations(self, task: Task) -> Dict[str, Any]:
        """Handle memory storage and retrieval operations"""
        from ..models import AgentMemory
        
        agent = task.assigned_agent
        input_data = task.input_data
        operation = input_data.get('operation', 'retrieve')
        
        stored_items = []
        retrieved_items = []
        memory_updates = []
        
        if operation == 'store':
            # Store new memory
            memory_data = input_data.get('memory_data', {})
            for key, value in memory_data.items():
                memory, created = AgentMemory.objects.update_or_create(
                    agent=agent,
                    session=self.session,
                    key=key,
                    defaults={
                        'value': value,
                        'importance_score': input_data.get('importance', 1.0)
                    }
                )
                stored_items.append({
                    'key': key,
                    'created': created,
                    'id': str(memory.id)
                })
        
        elif operation == 'retrieve':
            # Retrieve memories
            query = input_data.get('query', '')
            memories = self._get_relevant_memories(agent, query)
            retrieved_items = [
                {
                    'key': mem.key,
                    'value': mem.value,
                    'importance': mem.importance_score,
                    'last_accessed': mem.accessed_at.isoformat()
                }
                for mem in memories
            ]
        
        elif operation == 'update':
            # Update memory importance scores
            key = input_data.get('key')
            new_importance = input_data.get('importance')
            if key and new_importance is not None:
                AgentMemory.objects.filter(
                    agent=agent,
                    session=self.session,
                    key=key
                ).update(importance_score=new_importance)
                memory_updates.append({'key': key, 'new_importance': new_importance})
        
        return {
            'stored_items': stored_items,
            'retrieved_items': retrieved_items,
            'memory_updates': memory_updates
        }
    
    def _get_relevant_memories(self, agent: Agent, query: str, limit: int = 5):
        """Retrieve relevant memories for an agent based on query"""
        from ..models import AgentMemory
        
        # Get recent high-importance memories
        memories = AgentMemory.objects.filter(
            agent=agent,
            session=self.session
        ).order_by('-importance_score', '-accessed_at')[:limit]
        
        # Update access time
        for memory in memories:
            memory.accessed_at = datetime.now()
            memory.save(update_fields=['accessed_at'])
        
        return memories
    
    def _store_reasoning_memory(self, agent: Agent, response: Dict[str, Any]):
        """Store reasoning insights as memory"""
        from ..models import AgentMemory
        
        content = response.get('content', '')
        
        # Extract key insights (simplified - could use NLP)
        if len(content) > 50:
            memory_key = f"reasoning_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            AgentMemory.objects.create(
                agent=agent,
                session=self.session,
                key=memory_key,
                value={
                    'content': content[:500],  # Store first 500 chars
                    'timestamp': datetime.now().isoformat(),
                    'type': 'reasoning'
                },
                importance_score=0.8
            )
    
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