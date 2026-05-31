#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║         AUDIT MANAGEMENT SYSTEM - LAUNCHER          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "📋  Website 1 - Audit Board:      http://localhost:3000"
echo "📄  Website 2 - Report Portal:    http://localhost:3001"
echo "🔌  Backend API:                  http://localhost:5000"
echo "📖  API Docs:                     http://localhost:5000/docs"
echo ""
echo "🔑  Default Login: auditor / audit123"
echo ""
echo "⚠️  To enable LLM report generation:"
echo "    export ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "Starting all services..."
echo ""

# Start backend
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 5000 --reload &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Start Audit Board frontend
cd "$(dirname "$0")/frontend-auditboard"
npm install --legacy-peer-deps -s
PORT=3000 npm start &
BOARD_PID=$!
echo "✅ Audit Board started (PID: $BOARD_PID)"

# Start Report Portal frontend
cd "$(dirname "$0")/frontend-reportportal"
npm install --legacy-peer-deps -s
PORT=3001 npm start &
PORTAL_PID=$!
echo "✅ Report Portal started (PID: $PORTAL_PID)"

echo ""
echo "All services running. Press Ctrl+C to stop all."
echo ""

# Wait and cleanup
trap "kill $BACKEND_PID $BOARD_PID $PORTAL_PID 2>/dev/null; echo 'All services stopped.'" INT TERM
wait
