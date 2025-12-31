@echo off
title Backend Server
color 0B

cd /d "%~dp0"
echo Starting server...
echo.
python api_server.py

pause

