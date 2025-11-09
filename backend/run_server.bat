@echo off
echo Starting Django ASGI Server with WebSocket support...
echo.
echo Server will be available at:
echo   - HTTP: http://127.0.0.1:8000
echo   - WebSocket: ws://127.0.0.1:8000/ws/
echo.
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
