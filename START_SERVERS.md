# How to Start Both Servers

## Quick Start Script

Run these commands in separate terminal windows:

### Terminal 1 - Backend:
```powershell
cd backend
python api_server.py
```
Backend will run on: http://127.0.0.1:8000

### Terminal 2 - Frontend:
```powershell
cd trading-dashboard
npm run dev
```
Frontend will run on: http://localhost:5173

## Verification

1. **Backend**: Open http://127.0.0.1:8000/docs to see API documentation
2. **Frontend**: Open http://localhost:5173 to see the application

## Fixed Issues

✅ Created `vite.config.ts` - Missing configuration file
✅ Installed `@vitejs/plugin-react` - Required React plugin for Vite
✅ All TypeScript errors fixed
✅ All dependencies installed

## Status

✅ Backend: Ready to start
✅ Frontend: Ready to start
✅ All fixes applied

