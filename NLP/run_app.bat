@echo off
title ResearchAI Launcher
cd /d "%~dp0"
echo ========================================================
echo    Starting ResearchAI - AI Research Paper Companion
echo ========================================================
echo.

rem Priority 1: Direct Python 3.14 path where all AI/RAG packages are installed
if exist "C:\Python314\python.exe" (
    echo [OK] Using Python 3.14 environment...
    "C:\Python314\python.exe" start.py
    goto end
)

rem Priority 2: py -3.14 launcher
where py >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Using py -3.14 launcher...
    py -3.14 start.py
    goto end
)

rem Priority 3: system python
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Using system python...
    python start.py
    goto end
)

echo [ERROR] Python environment not found!
pause

:end
if errorlevel 1 (
    echo.
    echo Server process exited with code %errorlevel%.
    pause
)
