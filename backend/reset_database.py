"""
Database Reset Script
Fixes foreign key constraint issues by rebuilding the database
"""

import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from agents.models import Agent, Session, Message, AgentType, AgentStatus

User = get_user_model()

def reset_database():
    """Reset the database and create initial data"""
    
    print("=" * 60)
    print("DATABASE RESET SCRIPT")
    print("=" * 60)
    
    # Step 1: Delete all sessions (this should cascade delete messages)
    print("\n1. Deleting all sessions...")
    session_count = Session.objects.all().count()
    Session.objects.all().delete()
    print(f"   Deleted {session_count} sessions")
    
    # Step 2: Delete all agents
    print("\n2. Deleting all agents...")
    agent_count = Agent.objects.all().count()
    Agent.objects.all().delete()
    print(f"   Deleted {agent_count} agents")
    
    # Step 3: Delete all messages (if any orphaned)
    print("\n3. Deleting all messages...")
    message_count = Message.objects.all().count()
    Message.objects.all().delete()
    print(f"   Deleted {message_count} messages")
    
    # Step 4: Delete all users except superusers
    print("\n4. Deleting non-superuser users...")
    user_count = User.objects.filter(is_superuser=False).count()
    User.objects.filter(is_superuser=False).delete()
    print(f"   Deleted {user_count} users")
    
    # Step 5: Create default user
    print("\n5. Creating default user...")
    default_user, created = User.objects.get_or_create(
        email='default@example.com',
        defaults={
            'username': 'default_user',
            'first_name': 'Default',
            'last_name': 'User',
            'is_active': True,
            'is_staff': False,
            'is_superuser': False
        }
    )
    if created:
        default_user.set_password('default123')  # Set a password
        default_user.save()
        print(f"   ✓ Created default user: {default_user.email} (ID: {default_user.pk})")
    else:
        print(f"   ✓ Default user already exists: {default_user.email} (ID: {default_user.pk})")
    
    # Step 6: Create sample agents
    print("\n6. Creating sample agents...")
    
    agents_data = [
        {
            'name': 'Orchestrator Agent',
            'type': AgentType.ORCHESTRATOR,
            'capabilities': {'coordination': True, 'planning': True},
            'status': AgentStatus.ACTIVE
        },
        {
            'name': 'Vision Agent',
            'type': AgentType.VISION,
            'capabilities': {'image_analysis': True, 'ocr': True},
            'status': AgentStatus.ACTIVE
        },
        {
            'name': 'Reasoning Agent',
            'type': AgentType.REASONING,
            'capabilities': {'analysis': True, 'decision_making': True},
            'status': AgentStatus.ACTIVE
        },
        {
            'name': 'Action Agent',
            'type': AgentType.ACTION,
            'capabilities': {'execution': True, 'integration': True},
            'status': AgentStatus.ACTIVE
        },
    ]
    
    created_agents = []
    for agent_data in agents_data:
        agent, created = Agent.objects.get_or_create(
            name=agent_data['name'],
            defaults={
                'type': agent_data['type'],
                'capabilities': agent_data['capabilities'],
                'status': agent_data['status'],
                'owner': default_user
            }
        )
        created_agents.append(agent)
        if created:
            print(f"   ✓ Created agent: {agent.name}")
        else:
            print(f"   ✓ Agent already exists: {agent.name}")
    
    # Step 7: Create a sample session
    print("\n7. Creating sample session...")
    session, created = Session.objects.get_or_create(
        name='Welcome Session',
        user=default_user,
        defaults={
            'context': {'created_by': 'reset_script'},
            'is_active': True
        }
    )
    if created:
        # Add all agents to the session
        session.agents.set(created_agents)
        print(f"   ✓ Created session: {session.name} (ID: {session.id})")
    else:
        print(f"   ✓ Session already exists: {session.name} (ID: {session.id})")
    
    print("\n" + "=" * 60)
    print("DATABASE RESET COMPLETE!")
    print("=" * 60)
    print(f"\nDefault User Email: {default_user.email}")
    print(f"Default User Password: default123")
    print(f"Agents Created: {len(created_agents)}")
    print(f"Sample Session ID: {session.id}")
    print("\nYou can now start the server and test the application.")
    print("=" * 60)

if __name__ == '__main__':
    try:
        reset_database()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
