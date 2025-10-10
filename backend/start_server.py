#!/usr/bin/env python
"""
Django server startup script with WebSocket debugging
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def start_django_server():
    """Start Django development server with proper configuration"""
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    # Configure Django
    django.setup()
    
    # Print configuration info
    print("🚀 Starting Django Server with WebSocket Support")
    print(f"📁 Project Directory: {os.getcwd()}")
    print(f"🔧 Django Settings: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    
    # Check if we can import WebSocket components
    try:
        from agents.routing import websocket_urlpatterns
        from agents.simple_consumer import SimpleSessionConsumer
        print(f"✅ WebSocket routing loaded: {len(websocket_urlpatterns)} patterns")
        print(f"✅ SimpleSessionConsumer imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import WebSocket components: {e}")
        
    # Check channel layers
    from django.conf import settings
    if hasattr(settings, 'CHANNEL_LAYERS'):
        print(f"✅ Channel layers configured: {settings.CHANNEL_LAYERS}")
    else:
        print("❌ CHANNEL_LAYERS not configured")
        
    # Start the server
    print("\n🌐 Starting server on http://localhost:8000")
    print("🔗 WebSocket endpoints will be available at ws://localhost:8000/ws/")
    
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])

if __name__ == "__main__":
    start_django_server()