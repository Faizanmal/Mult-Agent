import json
import logging
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Agent, Session, Message
from .services.agent_coordinator import AgentCoordinator
from .services.groq_service import GroqService

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
        from django.contrib.auth.models import User
        
        # Get or create a default user for WebSocket sessions
        default_user, created = User.objects.get_or_create(
            username='websocket_user',
            defaults={'email': 'websocket@example.com'}
        )
        
        session = Session.objects.create(
            name=f'Session {self.session_id}',
            user=default_user,
            context={'created_via': 'websocket', 'original_session_id': self.session_id}
        )
        
        # Create default agents for this session
        default_agents = [
            {
                'name': 'Master Orchestrator',
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
        default_user, created = User.objects.get_or_create(
            username='system',
            defaults={
                'email': 'system@localhost',
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
        """Process message with agents"""
        try:
            print(f"DEBUG: Inside process_with_agents method")
            print(f"DEBUG: Processing with agents for session: {session.name}")
            print(f"DEBUG: Session agents count: {session.agents.count()}")
            print(f"DEBUG: Message content: {message.content}")
            print(f"DEBUG: Group name: {group_name}")
            
            # Simple test response for now
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            # Get the first agent to respond
            first_agent = session.agents.filter(is_active=True).first()
            agent_name = first_agent.name if first_agent else "AI Assistant"
            
            print(f"DEBUG: Selected agent: {agent_name}")
            
            # Create a more comprehensive response with better formatting
            response_content = f"Hello! I'm {agent_name} from the multi-agent system. I received your message: '{message.content}'. I'm processing it and will provide a comprehensive response shortly!"
            
            print(f"DEBUG: Sending agent response: {response_content}")
            
            channel_layer = get_channel_layer()
            print(f"DEBUG: Channel layer: {channel_layer}")
            
            # Use the passed group name
            print(f"DEBUG: About to send group message to: {group_name}")
            async_to_sync(channel_layer.group_send)(
                group_name,  # Fixed: use passed group_name
                {
                    "type": "agent_response", 
                    "response": {
                        "content": response_content,
                        "synthesized": True,
                        "orchestrator": agent_name,
                        "agent_id": str(first_agent.id) if first_agent else None
                    },
                    "original_message_id": str(message.id),  # Convert UUID to string
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            print(f"DEBUG: Agent response sent to group: {group_name}")
            
            # TODO: Later integrate full AgentCoordinator processing
            # coordinator = AgentCoordinator(session)
            # result = coordinator.process_message(message)
            
            return {"status": "processed", "agent": agent_name}
        except Exception as e:
            logger.error(f"Agent processing error: {str(e)}")
            print(f"DEBUG: Agent processing error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Send error response
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            try:
                channel_layer = get_channel_layer()
                # Use the passed group name
                async_to_sync(channel_layer.group_send)(
                    group_name,  # Fixed: use passed group_name
                    {
                        "type": "agent_response",
                        "response": {
                            "content": f"I encountered an issue but I'm working on it! Error details: {str(e)}",
                            "synthesized": False,
                            "orchestrator": "System",
                            "error": True
                        },
                        "original_message_id": str(message.id),  # Convert UUID to string
                        "timestamp": datetime.now().isoformat()
                    }
                )
            except Exception as send_error:
                print(f"DEBUG: Failed to send error response: {send_error}")
                traceback.print_exc()
                
            return None
    
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