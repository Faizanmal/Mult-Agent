#!/bin/bash

# Multi-Agent Setup Script
# This script sets up the database migrations for the new modules

echo "========================================="
echo "Multi-Agent Project Setup"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Please run this script from the backend directory."
    exit 1
fi

echo "📦 Step 1: Creating migrations for Multi_agents_cordination..."
python manage.py makemigrations Multi_agents_cordination

echo ""
echo "📦 Step 2: Creating migrations for Multi_model_Intelligence..."
python manage.py makemigrations Multi_model_Intelligence

echo ""
echo "📦 Step 3: Creating migrations for agents (if needed)..."
python manage.py makemigrations agents

echo ""
echo "🔄 Step 4: Applying all migrations..."
python manage.py migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Start the development server:"
echo "   python manage.py runserver"
echo ""
echo "2. Test the coordination API:"
echo "   curl http://localhost:8000/coordination/api/sessions/"
echo ""
echo "3. Test the intelligence API:"
echo "   curl http://localhost:8000/intelligence/api/models/"
echo ""
echo "4. View the full implementation summary:"
echo "   cat ../IMPLEMENTATION_SUMMARY.md"
echo "========================================="
