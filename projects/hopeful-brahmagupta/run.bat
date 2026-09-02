@echo off
chcp 65001 > nul
title Ox Alpha Agent Studio
echo ========================================================
echo   Ox Alpha Agent Studio (Antigravity Style Web Agent)
echo ========================================================
echo.
echo [1/2] 필수 파이썬 패키지 확인 중...
python -c "import fastapi, uvicorn, httpx, pydantic" 2>nul
if %errorlevel% neq 0 (
    echo [*] 필수 패키지 설치 진행 중 (fastapi uvicorn httpx pydantic)...
    pip install fastapi uvicorn httpx pydantic
)

echo [2/2] Ox Alpha Agent 서버 실행 및 브라우저 열기...
python start.py
pause
