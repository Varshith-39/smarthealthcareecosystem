@echo off
title Smart Healthcare AI Microservice (FastAPI + Ollama)
cd /d "%~dp0ai-service"
echo Starting Python FastAPI AI Microservice on http://localhost:8000...
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 8000
pause
