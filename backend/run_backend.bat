@echo off
cd /d "%~dp0"
echo Running backend from: %CD%
echo.
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
