@echo off
setlocal
cd /d "%~dp0"

rem ---- find a free port starting from 4002 ----
set PORT=4002
:findport
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>&1
if errorlevel 1 (
  set /a PORT=%PORT%+1
  if %PORT% GTR 4030 (
    echo.
    echo   No free port found between 4002 and 4030.
    echo   Close some preview windows and try again.
    echo.
    pause
    exit /b 1
  )
  goto findport
)

echo.
echo   ====================================================
echo    mystar local preview
echo.
echo      landing :  http://localhost:%PORT%/mystar/
echo      home    :  http://localhost:%PORT%/mystar/home/
echo.
echo    The browser opens automatically.
echo    Close this window to stop the server.
echo   ====================================================
echo.

node node_modules\hexo-cli\bin\hexo server -p %PORT% -o

echo.
echo   Server stopped.
pause
