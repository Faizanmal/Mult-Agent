@echo off
REM Quick Start Script for Multi-Agent Orchestration System
REM Windows version

echo ========================================
echo Multi-Agent Orchestration System
echo Quick Start Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/6] Checking Python installation...
python --version
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Node.js is not installed
    echo Frontend will not be set up
    set SKIP_FRONTEND=1
) else (
    echo [2/6] Checking Node.js installation...
    node --version
    echo.
)

REM Setup Backend
echo [3/6] Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Create superuser (optional)
echo.
set /p CREATE_SUPERUSER="Create superuser? (y/n): "
if /i "%CREATE_SUPERUSER%"=="y" (
    python manage.py createsuperuser
)

cd ..

REM Setup Frontend
if not defined SKIP_FRONTEND (
    echo.
    echo [4/6] Setting up Frontend...
    cd frontend
    
    REM Install npm dependencies
    echo Installing npm dependencies...
    call npm install
    
    cd ..
) else (
    echo [4/6] Skipping Frontend setup (Node.js not found)
)

REM Run tests
echo.
echo [5/6] Running tests...
cd backend
call venv\Scripts\activate.bat
python run_tests.py
cd ..

REM Final instructions
echo.
echo [6/6] Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
if not defined SKIP_FRONTEND (
    echo Frontend:
    echo   cd frontend
    echo   npm run dev
    echo.
)
echo Access the application:
echo   Backend API: http://localhost:8000
echo   Admin Panel: http://localhost:8000/admin
echo   Health Check: http://localhost:8000/health/
if not defined SKIP_FRONTEND (
    echo   Frontend: http://localhost:3000
)
echo.
echo ========================================
pause
