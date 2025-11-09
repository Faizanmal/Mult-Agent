import os
from groq import Groq
from typing import List, Dict, Any, Generator
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class GroqService:
    """Service for integrating with Groq API for fast inference"""
    
    def __init__(self):
        self.client = Groq(
            api_key=settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
        )
        self.default_model = settings.GROQ_CONFIG.get('MODEL', 'mixtral-8x7b-32768')
        self.default_temperature = settings.GROQ_CONFIG.get('TEMPERATURE', 0.7)
        self.default_max_tokens = settings.GROQ_CONFIG.get('MAX_TOKENS', 2048)
    
    def chat_completion(self, messages: List[Dict], model: str = None, **kwargs) -> Dict[str, Any]:
        """
        Get chat completion from Groq API with enhanced performance and error handling
        
        Args:
            messages: List of message dictionaries
            model: Model to use (defaults to configured model)
            **kwargs: Additional parameters
        
        Returns:
            Dict containing the response
        """
        try:
            # Enhanced parameters for better performance
            temperature = kwargs.get('temperature', self.default_temperature)
            max_tokens = kwargs.get('max_tokens', self.default_max_tokens)
            stream = kwargs.get('stream', False)
            
            # Optimize parameters based on message length for better performance
            if len(str(messages)) < 500:
                # For short messages, use faster parameters
                temperature = min(temperature, 0.5)  # Less creativity for simple tasks
                max_tokens = min(max_tokens, 512)    # Limit tokens for faster response
            
            response = self.client.chat.completions.create(
                messages=messages,
                model=model or self.default_model,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            
            if stream:
                return self._handle_stream_response(response)
            
            return {
                'content': response.choices[0].message.content,
                'model': response.model,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                },
                'finish_reason': response.choices[0].finish_reason,
                'response_time': response.usage.completion_tokens / 1000  # Approximate response time
            }
            
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return {
                'error': str(e),
                'content': None
            }
    
    def stream_completion(self, messages: List[Dict], session_id: str = None, model: str = None) -> Generator:
        """
        Stream chat completion from Groq API
        
        Args:
            messages: List of message dictionaries
            session_id: Session ID for WebSocket updates
            model: Model to use
        
        Yields:
            Chunks of the response
        """
        try:
            response = self.client.chat.completions.create(
                messages=messages,
                model=model or self.default_model,
                temperature=self.default_temperature,
                max_tokens=self.default_max_tokens,
                stream=True
            )
            
            full_content = ""
            
            for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_content += content
                    
                    # Send to WebSocket if session_id provided
                    if session_id:
                        self._send_stream_update(session_id, content, full_content)
                    
                    yield {
                        'content': content,
                        'full_content': full_content,
                        'done': False
                    }
            
            yield {
                'content': '',
                'full_content': full_content,
                'done': True
            }
            
        except Exception as e:
            logger.error(f"Groq streaming error: {str(e)}")
            yield {
                'error': str(e),
                'content': '',
                'done': True
            }
    
    def _handle_stream_response(self, stream) -> Dict[str, Any]:
        """Handle streaming response"""
        content = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content += chunk.choices[0].delta.content
        
        return {
            'content': content,
            'stream': True
        }
    
    def _send_stream_update(self, session_id: str, chunk: str, full_content: str):
        """Send streaming update via WebSocket"""
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session_id}",
            {
                "type": "stream_update",
                "chunk": chunk,
                "full_content": full_content
            }
        )
    
    def generate_agent_response(self, agent_type: str, context: Dict, user_input: str) -> Dict[str, Any]:
        """
        Generate response based on agent type and context
        
        Args:
            agent_type: Type of agent (orchestrator, vision, reasoning, etc.)
            context: Current context and conversation history
            user_input: User's input message
        
        Returns:
            Generated response
        """
        system_prompts = {
            'orchestrator': self._get_orchestrator_prompt(),
            'vision': self._get_vision_prompt(),
            'reasoning': self._get_reasoning_prompt(),
            'action': self._get_action_prompt(),
            'memory': self._get_memory_prompt()
        }
        
        system_prompt = system_prompts.get(agent_type, self._get_default_prompt())
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context: {json.dumps(context)}\n\nUser Input: {user_input}"}
        ]
        
        return self.chat_completion(messages)
    
    def _get_orchestrator_prompt(self) -> str:
        return """You are an Orchestrator Agent responsible for coordinating multiple specialized agents.
        Your role is to:
        1. Analyze user requests and break them down into tasks
        2. Assign tasks to appropriate specialized agents
        3. Coordinate the workflow between agents
        4. Synthesize results from multiple agents into coherent responses
        5. Manage task priorities and dependencies
        
        Always respond with clear task assignments and coordination instructions."""
    
    def _get_vision_prompt(self) -> str:
        return """You are a Vision Agent specialized in processing visual information.
        Your capabilities include:
        1. Image analysis and description
        2. Object detection and recognition
        3. OCR (text extraction from images)
        4. Visual reasoning and interpretation
        5. Chart and diagram analysis
        
        Always provide detailed, accurate visual analysis with confidence scores."""
    
    def _get_reasoning_prompt(self) -> str:
        return """You are a Reasoning Agent specialized in logical analysis and problem-solving.
        Your capabilities include:
        1. Logical reasoning and inference
        2. Problem decomposition and analysis
        3. Decision making with evidence
        4. Pattern recognition and analysis
        5. Critical thinking and evaluation
        
        Always provide step-by-step reasoning with clear justifications."""
    
    def _get_action_prompt(self) -> str:
        return """You are an Action Agent responsible for executing tasks and interfacing with external systems.
        Your capabilities include:
        1. API calls and external integrations
        2. File operations and data manipulation
        3. Task execution and automation
        4. System interactions and commands
        5. Result processing and validation
        
        Always confirm actions before execution and provide detailed status updates."""
    
    def _get_memory_prompt(self) -> str:
        return """You are a Memory Agent responsible for managing context and knowledge retention.
        Your capabilities include:
        1. Context storage and retrieval
        2. Knowledge base management
        3. Conversation history maintenance
        4. Pattern storage and recall
        5. Importance scoring and prioritization
        
        Always maintain accurate context and provide relevant historical information."""
    
    def _get_default_prompt(self) -> str:
        return """You are an AI assistant that provides helpful, accurate, and contextual responses.
        Analyze the given context and user input to provide the most appropriate response."""
    
    def analyze_multimodal_input(self, content: str, file_type: str = None, file_path: str = None) -> Dict[str, Any]:
        """
        Analyze multimodal input (text, image, audio, etc.)
        
        Args:
            content: Text content
            file_type: Type of attached file
            file_path: Path to the file
        
        Returns:
            Analysis results
        """
        analysis = {
            'text_analysis': None,
            'file_analysis': None,
            'combined_insights': None
        }
        
        # Analyze text content
        if content:
            text_messages = [
                {"role": "system", "content": "Analyze the following text and provide insights, key points, and any actionable items."},
                {"role": "user", "content": content}
            ]
            analysis['text_analysis'] = self.chat_completion(text_messages)
        
        # Analyze file if provided
        if file_path and file_type:
            file_analysis = self._analyze_file(file_path, file_type)
            analysis['file_analysis'] = file_analysis
        
        # Generate combined insights
        if analysis['text_analysis'] or analysis['file_analysis']:
            combined_messages = [
                {"role": "system", "content": "Combine the following analyses and provide comprehensive insights."},
                {"role": "user", "content": f"Text Analysis: {analysis['text_analysis']}\nFile Analysis: {analysis['file_analysis']}"}
            ]
            analysis['combined_insights'] = self.chat_completion(combined_messages)
        
        return analysis
    
    def _analyze_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """
        Analyze uploaded file based on its type
        
        Args:
            file_path: Path to the file
            file_type: Type of the file
        
        Returns:
            File analysis results
        """
        # This is a placeholder - actual implementation would use
        # specialized services for different file types
        return {
            'file_type': file_type,
            'file_path': file_path,
            'analysis': 'File analysis not yet implemented',
            'metadata': {}
        }