#!/bin/bash
# Multi-Asset Trading Dashboard - Complete Startup Script
# This script starts both frontend and backend servers with proper error handling

echo "════════════════════════════════════════════════════════════════"
echo "  Multi-Asset Trading Dashboard - Startup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "trading-dashboard" ]; then
    echo -e "${RED}Error: Not in the correct directory${NC}"
    echo "Please run this script from the root of the Multi-Asset Trading Dashboard project"
    exit 1
fi

echo -e "${YELLOW}Step 1: Starting Backend Server...${NC}"
echo "Backend will run on: http://127.0.0.1:8000"
echo ""

# Start backend in background
cd backend
python api_server.py &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Failed to start backend server${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

echo -e "${YELLOW}Step 2: Starting Frontend Server...${NC}"
echo "Frontend will run on: http://localhost:5173"
echo ""

# Start frontend in background
cd ../trading-dashboard
npm run dev &
FRONTEND_PID=$!

# Give frontend time to start
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Failed to start frontend server${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ All services running!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://127.0.0.1:8000"
echo "  API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "To stop the servers, press Ctrl+C"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
