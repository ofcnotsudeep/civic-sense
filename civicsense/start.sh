#!/bin/bash

# CivicSense — Quick Start Script

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  ██████╗██╗██╗   ██╗██╗ ██████╗███████╗███████╗███╗   ██╗███████╗███████╗${NC}"
echo -e "${CYAN} ██╔════╝██║██║   ██║██║██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝${NC}"
echo -e "${CYAN} ██║     ██║██║   ██║██║██║     ███████╗█████╗  ██╔██╗ ██║███████╗█████╗  ${NC}"
echo -e "${CYAN} ██║     ██║╚██╗ ██╔╝██║██║          ██║██╔══╝  ██║╚██╗██║╚════██║██╔══╝  ${NC}"
echo -e "${CYAN} ╚██████╗██║ ╚████╔╝ ██║╚██████╗███████║███████╗██║ ╚████║███████║███████╗${NC}"
echo -e "${CYAN}  ╚═════╝╚═╝  ╚═══╝  ╚═╝ ╚═════╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝${NC}"
echo ""
echo -e "${YELLOW}  AI Urban Intelligence Platform${NC}"
echo ""

# Check API key
if [ ! -f "backend/.env" ]; then
  echo -e "${RED}  ✗ backend/.env not found!${NC}"
  echo -e "  Copy backend/.env.example → backend/.env and set ANTHROPIC_API_KEY"
  echo ""
  exit 1
fi

if grep -q "your_api_key_here" backend/.env; then
  echo -e "${RED}  ✗ Set your ANTHROPIC_API_KEY in backend/.env first!${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}  ✓ API key found${NC}"

# Check node_modules
if [ ! -d "backend/node_modules" ]; then
  echo "  Installing backend dependencies..."
  cd backend && npm install --ignore-scripts && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "  Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo ""
echo -e "${GREEN}  Starting CivicSense...${NC}"
echo ""
echo -e "  Backend  → ${CYAN}http://localhost:3001${NC}"
echo -e "  Frontend → ${CYAN}http://localhost:5173${NC}"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop"
echo ""

# Start both
cd backend && node server.js &
BACKEND_PID=$!

cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Handle exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Stopped.'; exit" SIGINT SIGTERM

wait
