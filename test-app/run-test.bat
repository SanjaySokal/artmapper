@echo off
REM ArtMapper JavaScript Test Runner for Windows

echo Starting ArtMapper Test Application...

REM Start the application in background
start /B node App.js

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Run tests
echo Running tests...
node test.js
set TEST_EXIT_CODE=%ERRORLEVEL%

REM Stop the application (find and kill node process)
taskkill /F /IM node.exe /FI "WINDOWTITLE eq ArtMapper*" >nul 2>&1

exit /b %TEST_EXIT_CODE%

