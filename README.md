# Audit Management System

A full-stack audit management application with two websites and a Python backend.

## Architecture

```
audit-app/
├── backend/              # Python FastAPI backend (Port 5000)
├── frontend-auditboard/  # Website 1 - Audit Board (Port 3000)
├── frontend-reportportal/# Website 2 - Audit Report Portal (Port 3001)
└── start-all.sh          # Start everything at once
```

## Quick Start

### Option 1: Start Everything at Once
```bash
# Set your Anthropic API key (for LLM report generation)
export ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

chmod +x start-all.sh
./start-all.sh
```

### Option 2: Start Each Service Manually

**Terminal 1 - Backend:**
```bash
cd backend
export ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
chmod +x start.sh
./start.sh
```

**Terminal 2 - Audit Board (Website 1):**
```bash
cd frontend-auditboard
chmod +x start.sh
./start.sh
```

**Terminal 3 - Report Portal (Website 2):**
```bash
cd frontend-reportportal
chmod +x start.sh
./start.sh
```

## Access

| Service | URL |
|---------|-----|
| Audit Board | http://localhost:3000 |
| Report Portal | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/docs |

## Default Login
- **Username:** `auditor` | **Password:** `audit123`
- **Username:** `admin` | **Password:** `audit123`

## Features

### Website 1 - Audit Board (Port 3000)
- **Login** with auditor credentials
- **Tab: Create New Audit** — fill in a form with:
  - Audit Title, Opinion, Scope & Objectives
  - Background, Data Insights, Other Observations
  - Multiple Issues per audit, each with:
    - Issue Title, Rating (High/Moderate/Low)
    - Finding Type, Issue Cycle
    - Exact Findings, Repeat Findings
    - Issue Description, Control/Policy
    - Remediation Actions, Remediation Owner, Due Date
- **Tab: View Existing** — dashboard with all audits, stats, edit/delete/generate buttons
- **Generate Report** — triggers LLM to create the report (auto-syncs to Website 2)

### Website 2 - Audit Report Portal (Port 3001)
- **Login** with same credentials
- **Report List** — all audits with report status
- **Full Report View** with professional formatting:
  - Opinion section (preserved from Audit Board)
  - LLM-generated Results paragraph
  - Scope & Objectives (preserved)
  - LLM-rewritten Facility Background
  - Issue Summary table
  - Detailed Findings (LLM-enhanced, but preserves key fields)
  - Exact Findings section (always preserved verbatim)
- **Print to PDF** button

## LLM Behavior
The LLM (Claude) is used to:
- ✅ Rewrite: Issue Description, Remediation Actions narrative, Background/Facility text, Results paragraph
- 🔒 Preserve exactly: Audit Title, Opinion, Scope & Objectives, Issue Title, Issue Rating, Exact Findings, Repeat Findings, Control/Policy, Remediation Owner, Due Date

## Requirements
- Python 3.9+
- Node.js 16+
- Anthropic API key (optional — reports show placeholder text without it)
