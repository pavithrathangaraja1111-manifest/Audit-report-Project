#!/bin/bash
# Start the Audit Management Backend API

echo "====================================="
echo "  Audit Management API - Backend"
echo "====================================="

# Set your Anthropic API key here or export it before running
# export ANTHROPIC_API_KEY="sk-ant-..."

cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt -q

echo ""
echo "Starting server on http://localhost:5000"
echo "API Docs: http://localhost:5000/docs"
echo ""
echo "Default credentials:"
echo "  Username: auditor  Password: audit123"
echo "  Username: admin    Password: audit123"
echo ""

uvicorn main:app --host 0.0.0.0 --port 5000 --reload
