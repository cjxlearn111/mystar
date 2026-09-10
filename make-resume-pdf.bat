@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   Rebuilding resume PDF ...
echo.
python make-resume-pdf.py
echo.
pause
