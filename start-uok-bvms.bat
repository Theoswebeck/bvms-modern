@echo off
echo ======================================================================
echo   University of Kigali (UoK) - Booklet Verification Management System
echo   Starting Node.js Backend (Port 5000) and React Frontend (Port 5173)
echo ======================================================================

start "UoK BVMS Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm install && npm start"
start "UoK BVMS Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo Both servers have been launched in separate terminal windows!
