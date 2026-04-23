"""
Improved WebSocket Consumer with Enhanced Stability
"""
import json
import logging
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from agents.models import Agent, Session, Message
from datetime import datetime

logger = logging.getLogger(__name__)
User = get_user_model()


class ImprovedAgentConsumer(AsyncWebsocketConsumer):
    """
    Improved WebSocket consumer with:
    - Better error handling
    - Connection stability
    - Heartbeat mechanism
    - Automatic reconnection support
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_id = None
        self.user = None
        self.heartbeat_task = None
        self.is_connected = False
    
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            # Get session ID from URL
            self.session_id = self.scope['url_route']['kwargs'].get('session_id')
            self.user = self.scope.get('user')
            
            # Validate session
            if self.session_id:
                session_exists = await self.check_session_exists(self.session_id)
                if not session_exists:
                    logger.warning(f"Session {self.session_id} not found")
                    await self.close(code=4004)
                    return
            
            # Join session group
            if self.session_id:
                await self.channel_layer.group_add(
                    f"session_{self.session_id}",
                    self.channel_name
                )
            
            # Accept connection
            await self.accept()
            self.is_connected = True
            
            # Start heartbeat
            self.heartbeat_task = asyncio.create_task(self.send_heartbeat())
            
            # Send connection success message
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'session_id': self.session_id,
                'timestamp': datetime.now().isoformat(),
                'message': 'Connected successfully'
            }))
            
            logger.info(f"WebSocket connected: session={self.session_id}, user={self.user}")
        
        except Exception as e:
            logger.error(f"Connection error: {str(e)}", exc_info=True)
            await self.close(code=4000)
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            self.is_connected = False
            
            # Cancel heartbeat
            if self.heartbeat_task:
                self.heartbeat_task.cancel()
            
            # Leave session group
            if self.session_id:
                await self.channel_layer.group_discard(
                    f"session_{self.session_id}",
                    self.channel_name
                )
            
            logger.info(f"WebSocket disconnected: session={self.session_id}, code={close_code}")
        
        except Exception as e:
            logger.error(f"Disconnect error: {str(e)}", exc_info=True)
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            # Handle different message types
            if message_type == 'ping':
                await self.handle_ping(data)
            elif message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'agent_command':
                await self.handle_agent_command(data)
            else:
                await self.send_error(f"Unknown message type: {message_type}")
        
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            await self.send_error("Invalid JSON format")
        
        except Exception as e:
            logger.error(f"Receive error: {str(e)}", exc_info=True)
            await self.send_error(f"Error processing message: {str(e)}")
    
    async def handle_ping(self, data):
        """Handle ping messages"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': datetime.now().isoformat()
        }))
    
    async def handle_message(self, data):
        """Handle chat messages"""
        try:
            content = data.get('content', '')
            if not content:
                await self.send_error("Message content is required")
                return
            
            # Save message to database
            message = await self.save_message(content)
            
            # Broadcast to session group
            await self.channel_layer.group_send(
                f"session_{self.session_id}",
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message.id),
                        'content': content,
                        'sender': self.user.username if self.user else 'Anonymous',
                        'timestamp': message.created_at.isoformat()
                    }
                }
            )
        
        except Exception as e:
            logger.error(f"Handle message error: {str(e)}", exc_info=True)
            await self.send_error(f"Error handling message: {str(e)}")
    
    async def handle_agent_command(self, data):
        """Handle agent commands"""
        try:
            command = data.get('command')
            agent_id = data.get('agent_id')
            
            if not command or not agent_id:
                await self.send_error("Command and agent_id are required")
                return
            
            # Process agent command
            result = await self.process_agent_command(agent_id, command, data)
            
            # Send result
            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'agent_id': agent_id,
                'command': command,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }))
        
        except Exception as e:
            logger.error(f"Agent command error: {str(e)}", exc_info=True)
            await self.send_error(f"Error executing agent command: {str(e)}")
    
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'message',
                'data': event['message']
            }))
        except Exception as e:
            logger.error(f"Send message error: {str(e)}", exc_info=True)
    
    async def agent_update(self, event):
        """Send agent update to WebSocket"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'agent_update',
                'data': event['update']
            }))
        except Exception as e:
            logger.error(f"Send update error: {str(e)}", exc_info=True)
    
    async def send_error(self, error_message):
        """Send error message to client"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': error_message,
                'timestamp': datetime.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Send error failed: {str(e)}", exc_info=True)
    
    async def send_heartbeat(self):
        """Send periodic heartbeat to keep connection alive"""
        try:
            while self.is_connected:
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
                if self.is_connected:
                    await self.send(text_data=json.dumps({
                        'type': 'heartbeat',
                        'timestamp': datetime.now().isoformat()
                    }))
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Heartbeat error: {str(e)}", exc_info=True)
    
    @database_sync_to_async
    def check_session_exists(self, session_id):
        """Check if session exists"""
        try:
            return Session.objects.filter(id=session_id).exists()
        except Exception:
            return False
    
    @database_sync_to_async
    def save_message(self, content):
        """Save message to database"""
        try:
            session = Session.objects.get(id=self.session_id)
            message = Message.objects.create(
                session=session,
                sender=self.user if self.user and self.user.is_authenticated else None,
                content=content
            )
            return message
        except Exception as e:
            logger.error(f"Save message error: {str(e)}", exc_info=True)
            raise
    
    @database_sync_to_async
    def process_agent_command(self, agent_id, command, data):
        """Process agent command"""
        try:
            agent = Agent.objects.get(id=agent_id)
            # Process command based on type
            return {
                'status': 'success',
                'agent': agent.name,
                'command': command
            }
        except Agent.DoesNotExist:
            return {
                'status': 'error',
                'error': 'Agent not found'
            }
        except Exception as e:
            logger.error(f"Process command error: {str(e)}", exc_info=True)
            return {
                'status': 'error',
                'error': str(e)
            }
