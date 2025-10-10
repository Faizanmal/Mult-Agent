from django.urls import re_path
from . import consumers
from .simple_consumer import SimpleSessionConsumer

websocket_urlpatterns = [
    # Use simple consumer for testing WebSocket connections
    re_path(r'^ws/session/(?P<session_id>[^/]+)/$', SimpleSessionConsumer.as_asgi()),
    
    # Original complex consumer
    re_path(r'^ws/complex/session/(?P<session_id>[^/]+)/$', consumers.SessionConsumer.as_asgi()),
    
    # Other consumers
    re_path(r'^agents/user/(?P<user_id>[\w-]+)/$', consumers.UserConsumer.as_asgi()),
    re_path(r'^agents/agent/(?P<agent_id>[\w-]+)/$', consumers.AgentConsumer.as_asgi()),
]