@echo off
setlocal enabledelayedexpansion

REM Starts Kommune FastAPI backend binding to all interfaces.
REM Usage:
REM   start_backend.bat [PORT]

set PORT=%~1
if "%PORT%"=="" set PORT=8000

set HOST=0.0.0.0

echo Starting backend on %HOST%:%PORT%

REM Prefer python from PATH; adjust if you use venv/conda.
python -m uvicorn app.main:app --host %HOST% --port %PORT%

