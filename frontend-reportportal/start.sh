#!/bin/bash
echo "====================================="
echo "  Audit Report Portal - Website 2 (Port 3001)"
echo "====================================="
cd "$(dirname "$0")"
npm install --legacy-peer-deps 2>/dev/null
echo "Starting Audit Report Portal on http://localhost:3001"
PORT=3001 npm start
