@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "BACKEND_DIR=%ROOT_DIR%backend"

if not exist "%FRONTEND_DIR%\package.json" (
  echo Frontend project not found at "%FRONTEND_DIR%".
  exit /b 1
)

if not exist "%BACKEND_DIR%\app.py" (
  echo Backend app not found at "%BACKEND_DIR%".
  exit /b 1
)

echo Starting backend on http://localhost:5000 ...
if exist "%BACKEND_DIR%\venv\Scripts\activate.bat" (
  start "Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && call venv\Scripts\activate.bat && python app.py"
) else (
  start "Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && python app.py"
)

echo Starting frontend on http://localhost:3000 ...
start "Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev"

echo Both services are launching in separate windows.
endlocal
