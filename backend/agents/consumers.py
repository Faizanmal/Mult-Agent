import json
import logging
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Agent, Session, Message
from .services.agent_coordinator import AgentCoordinator
from .services.groq_service import GroqService

# Get the custom user model
User = get_user_model()

logger = logging.getLogger(__name__)

class SessionConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for session-based communication"""
    
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.session_group_name = f'session_{self.session_id}'
        
        print(f"DEBUG: WebSocket connection attempt for session: {self.session_id}")
        print(f"DEBUG: Group name: {self.session_group_name}")
        
        # Ensure session exists with default agents
        session = await self.ensure_session_exists()
        print(f"DEBUG: Session ensured: {session.id if session else 'None'}")
        
        # Join session group
        await self.channel_layer.group_add(
            self.session_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"DEBUG: WebSocket connection accepted for session: {self.session_id}")
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'session_id': self.session_id,
            'message': 'Connected to session'
        }))
    
    async def disconnect(self, close_code):
        # Leave session group
        await self.channel_layer.group_discard(
            self.session_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            logger.info(f"Received message: {data}")
            print(f"DEBUG: Received WebSocket message: {data}")
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'agent_command':
                await self.handle_agent_command(data)
            elif message_type == 'stream_request':
                await self.handle_stream_request(data)
            elif message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
            else:
                await self.send_error('Unknown message type')
                
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
        except Exception as e:
            logger.error(f"WebSocket receive error: {str(e)}")
            await self.send_error(f'Processing error: {str(e)}')
    
    async def handle_chat_message(self, data):
        """Handle incoming chat message"""
        content = data.get('content', '')
        user_id = data.get('user_id')
        message_type = data.get('message_type', 'text')
        
        print(f"DEBUG: Processing chat message: content='{content}', user_id={user_id}")
        
        if not content and message_type == 'text':
            await self.send_error('Message content is required')
            return
        
        # Get session and user
        session = await self.get_session()
        user = await self.get_user(user_id) if user_id else None
        
        print(f"DEBUG: Session found: {session is not None}")
        if session:
            print(f"DEBUG: Session name: {session.name}")
            print(f"DEBUG: Session agents count: {session.agents.count()}")
        
        if not session:
            await self.send_error('Session not found')
            return
        
        # Create message
        message = await self.create_message(session, user, content, message_type, data.get('metadata', {}))
        
        print(f"DEBUG: Message created: {message.id}")
        
        # Broadcast to session group
        await self.channel_layer.group_send(
            self.session_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': str(message.id),  # Convert UUID to string
                    'content': content,
                    'message_type': message_type,
                    'sender': user.username if user else 'Anonymous',
                    'timestamp': message.created_at.isoformat()
                }
            }
        )
        
        print(f"DEBUG: Message broadcasted to group: {self.session_group_name}")
        
        # Process with agents (async)
        print(f"DEBUG: About to call process_with_agents")
        try:
            result = await self.process_with_agents(session, message, self.session_group_name)
            print(f"DEBUG: process_with_agents completed successfully with result: {result}")
        except Exception as e:
            print(f"DEBUG: process_with_agents failed with error: {e}")
            import traceback
            traceback.print_exc()

    async def handle_agent_command(self, data):
        """Handle agent-specific commands"""
        command = data.get('command')
        agent_id = data.get('agent_id')
        
        if command == 'activate':
            await self.activate_agent(agent_id)
        elif command == 'deactivate':
            await self.deactivate_agent(agent_id)
        elif command == 'status':
            await self.get_agent_status(agent_id)
        else:
            await self.send_error(f'Unknown command: {command}')
    
    async def handle_stream_request(self, data):
        """Handle streaming request"""
        messages = data.get('messages', [])
        model = data.get('model', 'mixtral-8x7b-32768')
        
        # Start streaming response
        await self.send(text_data=json.dumps({
            'type': 'stream_start',
            'message': 'Starting stream response...'
        }))
        
        # This would be implemented with proper async streaming
        # For now, sending a placeholder
        await self.send(text_data=json.dumps({
            'type': 'stream_chunk',
            'content': 'This is a streaming response chunk.',
            'done': False
        }))
        
        await self.send(text_data=json.dumps({
            'type': 'stream_end',
            'content': '',
            'done': True
        }))
    
    # WebSocket message handlers
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
    
    async def agent_response(self, event):
        """Send agent response to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'agent_response',
            'response': event['response'],
            'original_message_id': event.get('original_message_id'),
            'timestamp': event.get('timestamp')
        }))
    
    async def task_completed(self, event):
        """Send task completion notification"""
        await self.send(text_data=json.dumps({
            'type': 'task_completed',
            'task_id': event['task_id'],
            'agent_name': event['agent_name'],
            'status': event['status'],
            'result': event['result']
        }))
    
    async def stream_start(self, event):
        """Handle stream start"""
        await self.send(text_data=json.dumps({
            'type': 'stream_start',
            'message': event['message']
        }))
    
    async def stream_update(self, event):
        """Handle stream update"""
        await self.send(text_data=json.dumps({
            'type': 'stream_chunk',
            'chunk': event['chunk'],
            'full_content': event['full_content'],
            'done': False
        }))
    
    async def stream_end(self, event):
        """Handle stream end"""
        await self.send(text_data=json.dumps({
            'type': 'stream_end',
            'full_content': event.get('full_content', ''),
            'done': True
        }))
    
    # Helper methods
    async def send_error(self, error_message):
        """Send error message"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))
    
    @database_sync_to_async
    def ensure_session_exists(self):
        """Ensure session exists with default agents"""
        try:
            # Try to get session by ID if it's a valid UUID
            import uuid as uuid_module
            try:
                session_uuid = uuid_module.UUID(self.session_id)
                session = Session.objects.get(id=session_uuid)
                return session
            except ValueError:
                # If session_id is not a valid UUID, try to find by name or create new
                pass
            
            # Try to find session by name for string IDs
            try:
                session = Session.objects.get(name=self.session_id)
                return session
            except Session.DoesNotExist:
                pass
                
        except Session.DoesNotExist:
            pass
        
        # Create new session with proper UUID
        import uuid as uuid_module
        # User is already imported at the top of the file
        
        # Get or create a default user for WebSocket sessions
        # Note: CustomUser uses email as USERNAME_FIELD
        default_user, created = User.objects.get_or_create(
            email='websocket@example.com',
            defaults={
                'username': 'websocket_user',
                'first_name': 'WebSocket',
                'last_name': 'User'
            }
        )
        
        session = Session.objects.create(
            name=f'Session {self.session_id}',
            user=default_user,
            context={'created_via': 'websocket', 'original_session_id': self.session_id}
        )
        
        # Create default agents for this session
        default_agents = [
            {
                'name': '   trator',
                'type': 'orchestrator',
                'capabilities': ['task_coordination', 'agent_management', 'workflow_optimization']
            },
            {
                'name': 'Vision Analyst',
                'type': 'vision', 
                'capabilities': ['image_analysis', 'object_detection', 'visual_reasoning']
            },
            {
                'name': 'Logic Engine',
                'type': 'reasoning',
                'capabilities': ['logical_reasoning', 'problem_solving', 'analysis']
            }
        ]
        
        # Get or create a default user for agents
        # Note: CustomUser uses email as USERNAME_FIELD
        default_user, created = User.objects.get_or_create(
            email='system@localhost',
            defaults={
                'username': 'system',
                'first_name': 'System',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        for agent_data in default_agents:
            agent = Agent.objects.create(
                name=agent_data['name'],
                type=agent_data['type'],
                capabilities=agent_data['capabilities'],
                owner=default_user,
                is_active=True,
                status='idle'
            )
            session.agents.add(agent)
            
        return session

    @database_sync_to_async
    def get_session(self):
        """Get session from database"""
        try:
            # Try UUID first
            import uuid as uuid_module
            try:
                session_uuid = uuid_module.UUID(self.session_id)
                return Session.objects.get(id=session_uuid)
            except ValueError:
                # Fall back to name lookup for string IDs
                pass
            
            # Try to find session by name for string IDs
            try:
                return Session.objects.get(name=self.session_id)
            except Session.DoesNotExist:
                pass
            
            # Try to find by original session ID in context
            try:
                return Session.objects.get(context__original_session_id=self.session_id)
            except Session.DoesNotExist:
                pass
                
        except Session.DoesNotExist:
            pass
            
        return None
    
    @database_sync_to_async
    def get_user(self, user_id):
        """Get user from database"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def create_message(self, session, user, content, message_type, metadata):
        """Create message in database"""
        return Message.objects.create(
            session=session,
            sender=user,
            content=content,
            message_type=message_type,
            metadata=metadata
        )
    
    @database_sync_to_async
    def process_with_agents(self, session, message, group_name):
        """Process message with agents using EnhancedAgentCoordinator for better performance"""
        try:
            print(f"DEBUG: Inside process_with_agents method")
            print(f"DEBUG: Processing with agents for session: {session.name}")
            print(f"DEBUG: Session agents count: {session.agents.count()}")
            print(f"DEBUG: Message content: {message.content}")
            print(f"DEBUG: Group name: {group_name}")
            
            from .services.enhanced_agent_coordinator import EnhancedAgentCoordinator
            from .services.groq_service import GroqService
            from django.conf import settings
            
            # Check if Groq API key is available
            groq_api_key = settings.GROQ_API_KEY
            if not groq_api_key:
                print("WARNING: GROQ_API_KEY not set. Using fallback response.")
                self._send_fallback_response(message, group_name, "Groq API key not configured")
                return {"status": "fallback", "reason": "no_api_key"}
            
            # Get the first active agent
            first_agent = session.agents.filter(is_active=True).first()
            agent_name = first_agent.name if first_agent else "Master Orchestrator"
            
            print(f"DEBUG: Selected agent: {agent_name}")
            
            # Use EnhancedAgentCoordinator to process the message for better performance
            try:
                coordinator = EnhancedAgentCoordinator(session)
                result = coordinator.process_message(message)
                
                print(f"DEBUG: EnhancedAgentCoordinator result: {result}")
                
                # Extract response content
                response_content = result.get('response', {}).get('content', '')
                
                if not response_content:
                    # Fallback: use Groq service directly
                    groq_service = GroqService()
                    
                    # Build conversation context
                    messages_history = [
                        {"role": "system", "content": f"You are {agent_name}, a helpful AI assistant in a multi-agent system. Provide detailed, informative responses."},
                        {"role": "user", "content": message.content}
                    ]
                    
                    # Get response from Groq
                    groq_response = groq_service.chat_completion(messages_history)
                    response_content = groq_response.get('content', 'I apologize, but I encountered an issue processing your request.')
                
                print(f"DEBUG: Final response content: {response_content[:100]}...")
                
            except Exception as e:
                print(f"ERROR in EnhancedAgentCoordinator: {e}")
                import traceback
                traceback.print_exc()
                
                # Fallback to direct Groq call
                try:
                    groq_service = GroqService()
                    messages_history = [
                        {"role": "system", "content": f"You are {agent_name}, a helpful AI assistant."},
                        {"role": "user", "content": message.content}
                    ]
                    groq_response = groq_service.chat_completion(messages_history)
                    response_content = groq_response.get('content', 'I apologize for the inconvenience.')
                except Exception as groq_error:
                    print(f"ERROR in Groq fallback: {groq_error}")
                    self._send_fallback_response(message, group_name, str(groq_error))
                    return {"status": "error", "error": str(groq_error)}
            
            # Send response via WebSocket
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "agent_response", 
                    "response": {
                        "content": response_content,
                        "synthesized": True,
                        "orchestrator": agent_name,
                        "agent_id": str(first_agent.id) if first_agent else None
                    },
                    "original_message_id": str(message.id),
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            print(f"DEBUG: Agent response sent successfully")
            return {"status": "processed", "agent": agent_name}
            
        except Exception as e:
            logger.error(f"Agent processing error: {str(e)}")
            print(f"DEBUG: Agent processing error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            self._send_error_response(message, group_name, str(e))
            return {"status": "error", "error": str(e)}
    
    def _send_fallback_response(self, message, group_name, reason):
        """Send a fallback response when API is not available"""
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        fallback_content = f"I received your message: '{message.content}'. However, I'm currently running in limited mode ({reason}). Please configure the GROQ_API_KEY environment variable for full AI capabilities."
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "agent_response",
                "response": {
                    "content": fallback_content,
                    "synthesized": False,
                    "orchestrator": "System",
                    "fallback": True
                },
                "original_message_id": str(message.id),
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def _send_error_response(self, message, group_name, error):
        """Send an error response"""
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "agent_response",
                "response": {
                    "content": f"I encountered an issue processing your request. Error: {error}",
                    "synthesized": False,
                    "orchestrator": "System",
                    "error": True
                },
                "original_message_id": str(message.id),
                "timestamp": datetime.now().isoformat()
            }
        )
    
    @database_sync_to_async
    def activate_agent(self, agent_id):
        """Activate agent"""
        try:
            agent = Agent.objects.get(id=agent_id)
            agent.status = 'active'
            agent.save()
            return True
        except Agent.DoesNotExist:
            return False
    
    @database_sync_to_async
    def deactivate_agent(self, agent_id):
        """Deactivate agent"""
        try:
            agent = Agent.objects.get(id=agent_id)
            agent.status = 'idle'
            agent.save()
            return True
        except Agent.DoesNotExist:
            return False
    
    @database_sync_to_async
    def get_agent_status(self, agent_id):
        """Get agent status"""
        try:
            agent = Agent.objects.get(id=agent_id)
            return {
                'id': str(agent.id),
                'name': agent.name,
                'status': agent.status,
                'type': agent.type
            }
        except Agent.DoesNotExist:
            return None

class UserConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for user-specific notifications"""
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'
        
        # Join user group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'user_id': self.user_id,
            'message': 'Connected to user notifications'
        }))
    
    async def disconnect(self, close_code):
        # Leave user group
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            # Handle user-specific commands if needed
            pass
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
    
    async def agent_status_update(self, event):
        """Handle agent status updates"""
        await self.send(text_data=json.dumps({
            'type': 'agent_status_update',
            'agent_id': event['agent_id'],
            'status': event['status']
        }))
    
    async def notification(self, event):
        """Handle general notifications"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message'],
            'level': event.get('level', 'info')
        }))
    
    async def send_error(self, error_message):
        """Send error message"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))

class AgentConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for agent-specific monitoring"""
    
    async def connect(self):
        self.agent_id = self.scope['url_route']['kwargs']['agent_id']
        self.agent_group_name = f'agent_{self.agent_id}'
        
        # Join agent group
        await self.channel_layer.group_add(
            self.agent_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send agent info
        agent_info = await self.get_agent_info()
        if agent_info:
            await self.send(text_data=json.dumps({
                'type': 'agent_connected',
                'agent': agent_info
            }))
    
    async def disconnect(self, close_code):
        # Leave agent group
        await self.channel_layer.group_discard(
            self.agent_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            # Handle agent-specific commands
            pass
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON format')
    
    async def performance_update(self, event):
        """Handle performance metric updates"""
        await self.send(text_data=json.dumps({
            'type': 'performance_update',
            'metrics': event['metrics']
        }))
    
    async def task_assigned(self, event):
        """Handle task assignment"""
        await self.send(text_data=json.dumps({
            'type': 'task_assigned',
            'task': event['task']
        }))
    
    async def send_error(self, error_message):
        """Send error message"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))
    
    @database_sync_to_async
    def get_agent_info(self):
        """Get agent information"""
        try:
            agent = Agent.objects.get(id=self.agent_id)
            return {
                'id': str(agent.id),
                'name': agent.name,
                'type': agent.type,
                'status': agent.status,
                'capabilities': agent.capabilities
            }
        except Agent.DoesNotExist:
            return None