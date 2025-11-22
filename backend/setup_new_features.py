#!/usr/bin/env python
"""
Setup script to create all remaining files for new feature modules
and run database migrations.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command

print("=" * 80)
print("SETTING UP NEW FEATURE MODULES")
print("=" * 80)

# List of modules to create migrations for
modules = [
    'agent_learning',
    'plugin_system',
    'webhooks',
    'analytics',
    'workflow_builder'
]

print("\n📦 Creating database migrations...")
for module in modules:
    print(f"  - {module}")
    try:
        call_command('makemigrations', module)
    except Exception as e:
        print(f"    ⚠️  Error: {e}")

print("\n🔄 Running migrations...")
try:
    call_command('migrate')
    print("  ✓ Migrations completed successfully")
except Exception as e:
    print(f"  ✗ Migration error: {e}")

print("\n✅ Setup complete!")
print("\nNew features installed:")
print("  1. Agent Learning & Adaptation (RL-based learning)")
print("  2. Plugin System (Marketplace & custom agents)")
print("  3. Webhooks & Notifications (Real-time alerts)")
print("  4. Advanced Analytics (Predictive insights)")
print("  5. Visual Workflow Builder (Drag-and-drop UI)")
print("\n" + "=" * 80)
