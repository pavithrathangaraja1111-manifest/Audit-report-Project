#!/bin/bash
echo "====================================="
echo "  Audit Board - Website 1 (Port 3000)"
echo "====================================="
cd "$(dirname "$0")"
npm install --legacy-peer-deps 2>/dev/null
echo "Starting Audit Board on http://localhost:3000"
npm start
