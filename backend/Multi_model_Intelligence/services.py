"""
Advanced Multi-Model Intelligence Service
Supports dynamic model switching and orchestration across Groq, OpenAI, and Anthropic
"""

import logging
import time
from typing import Dict, Any, List, Optional, Generator
from enum import Enum
import json
from django.conf import settings
import os

logger = logging.getLogger(__name__)


class ModelProvider(Enum):
    """Supported model providers"""
    GROQ = "groq"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    

class TaskComplexity(Enum):
    """Task complexity levels for dynamic model selection"""
    SIMPLE = "simple"  # Quick queries, basic operations
    MODERATE = "moderate"  # Analysis, summaries
    COMPLEX = "complex"  # Deep reasoning, multi-step tasks
    CREATIVE = "creative"  # Content generation, creative writing


class ModelConfig:
    """Configuration for different models"""
    
    # Model capabilities and cost tiers
    MODELS = {
        # Groq models - ultra-fast inference
        ModelProvider.GROQ: {
            "llama-3.3-70b-versatile": {
                "complexity": [TaskComplexity.SIMPLE, TaskComplexity.MODERATE, TaskComplexity.COMPLEX],
                "speed": "ultra_fast",
                "cost": "low",
                "context_window": 32768,
                "strengths": ["speed", "reasoning", "general_purpose"]
            },
            "llama-3.3-70b-specdec": {
                "complexity": [TaskComplexity.SIMPLE, TaskComplexity.MODERATE],
                "speed": "ultra_fast",
                "cost": "low",
                "context_window": 8192,
                "strengths": ["speed", "structured_output"]
            },
            "mixtral-8x7b-32768": {
                "complexity": [TaskComplexity.MODERATE],
                "speed": "fast",
                "cost": "low",
                "context_window": 32768,
                "strengths": ["multilingual", "reasoning"]
            }
        },
        # OpenAI models - balanced quality
        ModelProvider.OPENAI: {
            "gpt-4": {
                "complexity": [TaskComplexity.COMPLEX, TaskComplexity.CREATIVE],
                "speed": "medium",
                "cost": "high",
                "context_window": 8192,
                "strengths": ["reasoning", "accuracy", "creative"]
            },
            "gpt-4-turbo": {
                "complexity": [TaskComplexity.COMPLEX, TaskComplexity.MODERATE],
                "speed": "fast",
                "cost": "medium",
                "context_window": 128000,
                "strengths": ["long_context", "reasoning", "vision"]
            },
            "gpt-3.5-turbo": {
                "complexity": [TaskComplexity.SIMPLE, TaskComplexity.MODERATE],
                "speed": "fast",
                "cost": "low",
                "context_window": 16385,
                "strengths": ["speed", "cost_effective"]
            }
        },
        # Anthropic models - advanced reasoning
        ModelProvider.ANTHROPIC: {
            "claude-3-opus": {
                "complexity": [TaskComplexity.COMPLEX, TaskComplexity.CREATIVE],
                "speed": "medium",
                "cost": "high",
                "context_window": 200000,
                "strengths": ["reasoning", "long_context", "analysis"]
            },
            "claude-3-sonnet": {
                "complexity": [TaskComplexity.MODERATE, TaskComplexity.COMPLEX],
                "speed": "fast",
                "cost": "medium",
                "context_window": 200000,
                "strengths": ["balanced", "long_context"]
            },
            "claude-3-haiku": {
                "complexity": [TaskComplexity.SIMPLE, TaskComplexity.MODERATE],
                "speed": "ultra_fast",
                "cost": "low",
                "context_window": 200000,
                "strengths": ["speed", "cost_effective"]
            }
        }
    }


class MultiModelOrchestrator:
    """
    Orchestrates multiple AI models with intelligent routing and fallback
    """
    
    def __init__(self):
        self._init_clients()
        self.performance_history = []
        
    def _init_clients(self):
        """Initialize API clients for all providers"""
        # Groq client
        try:
            from groq import Groq
            self.groq_client = Groq(
                api_key=settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY')
            )
        except Exception as e:
            logger.warning(f"Groq client initialization failed: {e}")
            self.groq_client = None
        
        # OpenAI client
        try:
            from openai import OpenAI
            self.openai_client = OpenAI(
                api_key=settings.OPENAI_API_KEY or os.getenv('OPENAI_API_KEY')
            )
        except Exception as e:
            logger.warning(f"OpenAI client initialization failed: {e}")
            self.openai_client = None
        
        # Anthropic client
        try:
            import anthropic
            self.anthropic_client = anthropic.Anthropic(
                api_key=settings.ANTHROPIC_API_KEY if hasattr(settings, 'ANTHROPIC_API_KEY') else os.getenv('ANTHROPIC_API_KEY')
            )
        except Exception as e:
            logger.warning(f"Anthropic client initialization failed: {e}")
            self.anthropic_client = None
    
    def analyze_task_complexity(self, messages: List[Dict], context: Dict = None) -> TaskComplexity:
        """
        Analyze task complexity to determine optimal model
        
        Args:
            messages: List of conversation messages
            context: Additional context about the task
            
        Returns:
            TaskComplexity enum value
        """
        # Get last user message
        user_messages = [m for m in messages if m.get('role') == 'user']
        if not user_messages:
            return TaskComplexity.SIMPLE
        
        last_message = user_messages[-1].get('content', '')
        message_length = len(last_message)
        
        # Analyze message characteristics
        complexity_indicators = {
            'creative_keywords': ['write', 'create', 'generate', 'story', 'poem', 'creative'],
            'complex_keywords': ['analyze', 'explain', 'compare', 'evaluate', 'why', 'how'],
            'simple_keywords': ['what', 'when', 'where', 'list', 'show']
        }
        
        # Check for creative task
        if any(kw in last_message.lower() for kw in complexity_indicators['creative_keywords']):
            return TaskComplexity.CREATIVE
        
        # Check for complex reasoning
        if any(kw in last_message.lower() for kw in complexity_indicators['complex_keywords']):
            if message_length > 200 or len(messages) > 5:
                return TaskComplexity.COMPLEX
            return TaskComplexity.MODERATE
        
        # Check message length and conversation depth
        if message_length > 500 or len(messages) > 10:
            return TaskComplexity.COMPLEX
        elif message_length > 100 or len(messages) > 3:
            return TaskComplexity.MODERATE
        
        return TaskComplexity.SIMPLE
    
    def select_optimal_model(
        self, 
        complexity: TaskComplexity, 
        priority: str = "balanced",
        constraints: Dict = None
    ) -> tuple:
        """
        Select optimal model based on task complexity and priorities
        
        Args:
            complexity: Task complexity level
            priority: "speed", "cost", "quality", or "balanced"
            constraints: Additional constraints (max_cost, required_speed, etc.)
            
        Returns:
            Tuple of (provider, model_name)
        """
        constraints = constraints or {}
        candidates = []
        
        # Collect all models matching complexity
        for provider, models in ModelConfig.MODELS.items():
            for model_name, config in models.items():
                if complexity in config['complexity']:
                    score = self._score_model(config, priority, constraints)
                    candidates.append((score, provider, model_name, config))
        
        # Sort by score
        candidates.sort(reverse=True, key=lambda x: x[0])
        
        if not candidates:
            # Fallback to default Groq model
            logger.warning(f"No model found for complexity {complexity}, using default")
            return ModelProvider.GROQ, "llama-3.3-70b-versatile"
        
        _, provider, model_name, _ = candidates[0]
        logger.info(f"Selected {provider.value}/{model_name} for {complexity.value} task with {priority} priority")
        
        return provider, model_name
    
    def _score_model(self, config: Dict, priority: str, constraints: Dict) -> float:
        """Score a model based on priority and constraints"""
        score = 0.0
        
        # Speed scoring
        speed_scores = {"ultra_fast": 1.0, "fast": 0.7, "medium": 0.4, "slow": 0.1}
        speed_score = speed_scores.get(config['speed'], 0.5)
        
        # Cost scoring (inverted - lower cost = higher score)
        cost_scores = {"low": 1.0, "medium": 0.6, "high": 0.3}
        cost_score = cost_scores.get(config['cost'], 0.5)
        
        # Apply priority weights
        if priority == "speed":
            score = speed_score * 0.7 + cost_score * 0.3
        elif priority == "cost":
            score = cost_score * 0.7 + speed_score * 0.3
        elif priority == "quality":
            # Quality inversely correlates with speed (generally)
            score = (1 - speed_score) * 0.6 + cost_score * 0.4
        else:  # balanced
            score = (speed_score + cost_score) * 0.5
        
        # Apply constraints
        if constraints.get('max_cost') == 'low' and config['cost'] != 'low':
            score *= 0.5
        if constraints.get('min_speed') == 'fast' and config['speed'] not in ['fast', 'ultra_fast']:
            score *= 0.5
        
        return score
    
    def chat_completion(
        self,
        messages: List[Dict],
        complexity: Optional[TaskComplexity] = None,
        provider: Optional[ModelProvider] = None,
        model: Optional[str] = None,
        priority: str = "balanced",
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute chat completion with automatic model selection
        
        Args:
            messages: Conversation messages
            complexity: Task complexity (auto-detected if None)
            provider: Force specific provider (optional)
            model: Force specific model (optional)
            priority: Selection priority
            stream: Enable streaming
            **kwargs: Additional parameters
            
        Returns:
            Response dictionary with content and metadata
        """
        start_time = time.time()
        
        # Auto-detect complexity if not provided
        if complexity is None:
            complexity = self.analyze_task_complexity(messages, kwargs.get('context'))
        
        # Select model if not forced
        if provider is None or model is None:
            provider, model = self.select_optimal_model(complexity, priority, kwargs.get('constraints'))
        
        # Execute with selected provider
        try:
            if provider == ModelProvider.GROQ:
                result = self._groq_completion(messages, model, stream, **kwargs)
            elif provider == ModelProvider.OPENAI:
                result = self._openai_completion(messages, model, stream, **kwargs)
            elif provider == ModelProvider.ANTHROPIC:
                result = self._anthropic_completion(messages, model, stream, **kwargs)
            else:
                raise ValueError(f"Unsupported provider: {provider}")
            
            # Track performance
            duration = time.time() - start_time
            self._track_performance(provider, model, complexity, duration, result)
            
            # Add metadata
            result['metadata'] = {
                'provider': provider.value,
                'model': model,
                'complexity': complexity.value,
                'duration': duration,
                'priority': priority
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Model execution failed: {e}")
            # Attempt fallback
            return self._execute_fallback(messages, provider, complexity, stream, **kwargs)
    
    def _groq_completion(self, messages: List[Dict], model: str, stream: bool, **kwargs) -> Dict:
        """Execute Groq completion"""
        if not self.groq_client:
            raise Exception("Groq client not initialized")
        
        response = self.groq_client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 2048),
            stream=stream
        )
        
        if stream:
            return {'stream': response, 'provider': 'groq'}
        
        return {
            'content': response.choices[0].message.content,
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            },
            'finish_reason': response.choices[0].finish_reason
        }
    
    def _openai_completion(self, messages: List[Dict], model: str, stream: bool, **kwargs) -> Dict:
        """Execute OpenAI completion"""
        if not self.openai_client:
            raise Exception("OpenAI client not initialized")
        
        response = self.openai_client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=kwargs.get('temperature', 0.7),
            max_tokens=kwargs.get('max_tokens', 2048),
            stream=stream
        )
        
        if stream:
            return {'stream': response, 'provider': 'openai'}
        
        return {
            'content': response.choices[0].message.content,
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            },
            'finish_reason': response.choices[0].finish_reason
        }
    
    def _anthropic_completion(self, messages: List[Dict], model: str, stream: bool, **kwargs) -> Dict:
        """Execute Anthropic completion"""
        if not self.anthropic_client:
            raise Exception("Anthropic client not initialized")
        
        # Convert messages format for Anthropic
        system_message = ""
        anthropic_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                anthropic_messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        response = self.anthropic_client.messages.create(
            model=model,
            max_tokens=kwargs.get('max_tokens', 2048),
            temperature=kwargs.get('temperature', 0.7),
            system=system_message,
            messages=anthropic_messages,
            stream=stream
        )
        
        if stream:
            return {'stream': response, 'provider': 'anthropic'}
        
        return {
            'content': response.content[0].text,
            'usage': {
                'prompt_tokens': response.usage.input_tokens,
                'completion_tokens': response.usage.output_tokens,
                'total_tokens': response.usage.input_tokens + response.usage.output_tokens
            },
            'finish_reason': response.stop_reason
        }
    
    def _execute_fallback(
        self, 
        messages: List[Dict], 
        failed_provider: ModelProvider,
        complexity: TaskComplexity,
        stream: bool,
        **kwargs
    ) -> Dict:
        """Execute fallback strategy when primary model fails"""
        logger.info(f"Executing fallback after {failed_provider.value} failure")
        
        # Try alternative providers in order
        fallback_order = [
            ModelProvider.GROQ,
            ModelProvider.OPENAI,
            ModelProvider.ANTHROPIC
        ]
        
        # Remove failed provider
        fallback_order = [p for p in fallback_order if p != failed_provider]
        
        for provider in fallback_order:
            try:
                _, model = self.select_optimal_model(complexity, "balanced")
                
                if provider == ModelProvider.GROQ:
                    return self._groq_completion(messages, model, stream, **kwargs)
                elif provider == ModelProvider.OPENAI:
                    return self._openai_completion(messages, model, stream, **kwargs)
                elif provider == ModelProvider.ANTHROPIC:
                    return self._anthropic_completion(messages, model, stream, **kwargs)
                    
            except Exception as e:
                logger.warning(f"Fallback to {provider.value} failed: {e}")
                continue
        
        return {
            'error': 'All providers failed',
            'content': None
        }
    
    def _track_performance(
        self, 
        provider: ModelProvider, 
        model: str, 
        complexity: TaskComplexity,
        duration: float,
        result: Dict
    ):
        """Track model performance for optimization"""
        self.performance_history.append({
            'timestamp': time.time(),
            'provider': provider.value,
            'model': model,
            'complexity': complexity.value,
            'duration': duration,
            'success': 'error' not in result,
            'tokens': result.get('usage', {}).get('total_tokens', 0)
        })
        
        # Keep last 1000 records
        if len(self.performance_history) > 1000:
            self.performance_history = self.performance_history[-1000:]
    
    def get_performance_insights(self) -> Dict[str, Any]:
        """Get performance insights and recommendations"""
        if not self.performance_history:
            return {'message': 'No performance data available'}
        
        # Calculate statistics
        total_requests = len(self.performance_history)
        success_rate = sum(1 for r in self.performance_history if r['success']) / total_requests
        avg_duration = sum(r['duration'] for r in self.performance_history) / total_requests
        
        # Provider statistics
        provider_stats = {}
        for record in self.performance_history:
            provider = record['provider']
            if provider not in provider_stats:
                provider_stats[provider] = {'requests': 0, 'avg_duration': 0, 'success_rate': 0}
            provider_stats[provider]['requests'] += 1
        
        return {
            'total_requests': total_requests,
            'success_rate': success_rate,
            'avg_duration': avg_duration,
            'provider_stats': provider_stats,
            'recommendations': self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate optimization recommendations based on performance history"""
        recommendations = []
        
        if not self.performance_history:
            return recommendations
        
        # Analyze recent performance
        recent = self.performance_history[-100:]
        
        # Check for high failure rate
        failure_rate = sum(1 for r in recent if not r['success']) / len(recent)
        if failure_rate > 0.1:
            recommendations.append("High failure rate detected. Consider reviewing API keys and rate limits.")
        
        # Check for slow responses
        avg_duration = sum(r['duration'] for r in recent) / len(recent)
        if avg_duration > 5.0:
            recommendations.append("Slow response times detected. Consider using faster models for simple tasks.")
        
        return recommendations


# Singleton instance
_orchestrator_instance = None

def get_orchestrator() -> MultiModelOrchestrator:
    """Get or create orchestrator singleton"""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = MultiModelOrchestrator()
    return _orchestrator_instance
