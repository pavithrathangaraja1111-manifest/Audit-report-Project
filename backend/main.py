from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import json
import hashlib
import jwt
import httpx
import os
from datetime import datetime, timedelta

app = FastAPI(title="Audit Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "audit-secret-key-2026"
ALGORITHM = "HS256"
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

security = HTTPBearer(auto_error=False)

# ─── DB SETUP ────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect("audits.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'auditor'
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_title TEXT NOT NULL,
            opinion TEXT,
            scope_and_objectives TEXT,
            background TEXT,
            data_insights TEXT,
            other_observations TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_id INTEGER NOT NULL,
            issue_title TEXT,
            issue_rating TEXT,
            finding_type TEXT,
            issue_cycle TEXT,
            exact_findings TEXT,
            repeat_findings TEXT,
            issue_description TEXT,
            control_policy TEXT,
            remediation_actions TEXT,
            remediation_owner TEXT,
            due_date TEXT,
            FOREIGN KEY (audit_id) REFERENCES audits(id)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS audit_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_id INTEGER UNIQUE NOT NULL,
            results_paragraph TEXT,
            facility_background TEXT,
            scope_section TEXT,
            issues_section TEXT,
            generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (audit_id) REFERENCES audits(id)
        )
    """)
    # Seed default user
    pw_hash = hashlib.sha256("audit123".encode()).hexdigest()
    c.execute("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
              ("auditor", pw_hash, "auditor"))
    c.execute("INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
              ("admin", pw_hash, "admin"))
    conn.commit()
    conn.close()

init_db()

# ─── AUTH ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

def create_token(username: str, role: str):
    exp = datetime.utcnow() + timedelta(hours=24)
    payload = {"sub": username, "role": role, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/login")
def login(req: LoginRequest):
    conn = get_db()
    pw_hash = hashlib.sha256(req.password.encode()).hexdigest()
    user = conn.execute(
        "SELECT * FROM users WHERE username=? AND password_hash=?", (req.username, pw_hash)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["username"], user["role"])
    return {"token": token, "username": user["username"], "role": user["role"]}

# ─── AUDIT MODELS ─────────────────────────────────────────────────────────────

class IssueModel(BaseModel):
    issue_title: Optional[str] = ""
    issue_rating: Optional[str] = ""
    finding_type: Optional[str] = ""
    issue_cycle: Optional[str] = ""
    exact_findings: Optional[str] = ""
    repeat_findings: Optional[str] = ""
    issue_description: Optional[str] = ""
    control_policy: Optional[str] = ""
    remediation_actions: Optional[str] = ""
    remediation_owner: Optional[str] = ""
    due_date: Optional[str] = ""

class AuditCreate(BaseModel):
    audit_title: str
    opinion: Optional[str] = ""
    scope_and_objectives: Optional[str] = ""
    background: Optional[str] = ""
    data_insights: Optional[str] = ""
    other_observations: Optional[str] = ""
    issues: Optional[List[IssueModel]] = []

class AuditUpdate(BaseModel):
    audit_title: Optional[str] = None
    opinion: Optional[str] = None
    scope_and_objectives: Optional[str] = None
    background: Optional[str] = None
    data_insights: Optional[str] = None
    other_observations: Optional[str] = None
    issues: Optional[List[IssueModel]] = None

# ─── AUDIT ENDPOINTS ──────────────────────────────────────────────────────────

@app.get("/api/audits")
def list_audits(user=Depends(verify_token)):
    conn = get_db()
    audits = conn.execute("SELECT * FROM audits ORDER BY created_at DESC").fetchall()
    result = []
    for a in audits:
        audit_dict = dict(a)
        issues = conn.execute("SELECT * FROM issues WHERE audit_id=?", (a["id"],)).fetchall()
        audit_dict["issues"] = [dict(i) for i in issues]
        report = conn.execute("SELECT * FROM audit_reports WHERE audit_id=?", (a["id"],)).fetchone()
        audit_dict["has_report"] = report is not None
        result.append(audit_dict)
    conn.close()
    return result

@app.get("/api/audits/{audit_id}")
def get_audit(audit_id: int, user=Depends(verify_token)):
    conn = get_db()
    audit = conn.execute("SELECT * FROM audits WHERE id=?", (audit_id,)).fetchone()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    audit_dict = dict(audit)
    issues = conn.execute("SELECT * FROM issues WHERE audit_id=?", (audit_id,)).fetchall()
    audit_dict["issues"] = [dict(i) for i in issues]
    conn.close()
    return audit_dict

@app.post("/api/audits")
def create_audit(audit: AuditCreate, user=Depends(verify_token)):
    conn = get_db()
    now = datetime.utcnow().isoformat()
    cur = conn.execute(
        """INSERT INTO audits (audit_title, opinion, scope_and_objectives, background,
           data_insights, other_observations, created_at, updated_at, created_by)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (audit.audit_title, audit.opinion, audit.scope_and_objectives, audit.background,
         audit.data_insights, audit.other_observations, now, now, user["sub"])
    )
    audit_id = cur.lastrowid
    for issue in (audit.issues or []):
        conn.execute(
            """INSERT INTO issues (audit_id, issue_title, issue_rating, finding_type, issue_cycle,
               exact_findings, repeat_findings, issue_description, control_policy,
               remediation_actions, remediation_owner, due_date)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (audit_id, issue.issue_title, issue.issue_rating, issue.finding_type, issue.issue_cycle,
             issue.exact_findings, issue.repeat_findings, issue.issue_description, issue.control_policy,
             issue.remediation_actions, issue.remediation_owner, issue.due_date)
        )
    conn.commit()
    conn.close()
    return {"id": audit_id, "message": "Audit created successfully"}

@app.put("/api/audits/{audit_id}")
def update_audit(audit_id: int, audit: AuditUpdate, user=Depends(verify_token)):
    conn = get_db()
    existing = conn.execute("SELECT * FROM audits WHERE id=?", (audit_id,)).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Audit not found")
    fields = []
    values = []
    for field, val in audit.dict(exclude_none=True, exclude={"issues"}).items():
        fields.append(f"{field}=?")
        values.append(val)
    if fields:
        fields.append("updated_at=?")
        values.append(datetime.utcnow().isoformat())
        values.append(audit_id)
        conn.execute(f"UPDATE audits SET {', '.join(fields)} WHERE id=?", values)
    if audit.issues is not None:
        conn.execute("DELETE FROM issues WHERE audit_id=?", (audit_id,))
        for issue in audit.issues:
            conn.execute(
                """INSERT INTO issues (audit_id, issue_title, issue_rating, finding_type, issue_cycle,
                   exact_findings, repeat_findings, issue_description, control_policy,
                   remediation_actions, remediation_owner, due_date)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (audit_id, issue.issue_title, issue.issue_rating, issue.finding_type, issue.issue_cycle,
                 issue.exact_findings, issue.repeat_findings, issue.issue_description, issue.control_policy,
                 issue.remediation_actions, issue.remediation_owner, issue.due_date)
            )
    conn.commit()
    conn.close()
    return {"message": "Audit updated successfully"}

@app.delete("/api/audits/{audit_id}")
def delete_audit(audit_id: int, user=Depends(verify_token)):
    conn = get_db()
    conn.execute("DELETE FROM issues WHERE audit_id=?", (audit_id,))
    conn.execute("DELETE FROM audit_reports WHERE audit_id=?", (audit_id,))
    conn.execute("DELETE FROM audits WHERE id=?", (audit_id,))
    conn.commit()
    conn.close()
    return {"message": "Audit deleted"}

# ─── LLM REPORT GENERATION ────────────────────────────────────────────────────

async def call_claude(prompt: str) -> str:
    """Call Anthropic Claude API"""
    api_key = ANTHROPIC_API_KEY
    if not api_key:
        return "[LLM output placeholder - set ANTHROPIC_API_KEY env variable]"
    
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        data = resp.json()
        return data["content"][0]["text"]

def build_results_prompt(audit, issues):
    issue_list = "\n".join([
        f"- Issue #{i+1}: {iss['issue_title']} (Rating: {iss['issue_rating']}, Finding Type: {iss['finding_type']})"
        for i, iss in enumerate(issues)
    ])
    high = [i for i in issues if (i.get("issue_rating") or "").lower() == "high"]
    moderate = [i for i in issues if (i.get("issue_rating") or "").lower() == "moderate"]
    low = [i for i in issues if (i.get("issue_rating") or "").lower() == "low"]

    return f"""You are an internal audit report writer. Generate a professional 'Results' paragraph for an audit report.

RULES:
- DO NOT rewrite or change: Audit Title, Opinion, Scope & Objectives, Issue Titles, Issue Ratings, Exact Findings, Repeat Findings, Control/Policy, Remediation Owner, Due Dates.
- Write in third-person professional tone.
- The paragraph should include: total issues observed, breakdown by risk rating (High, Moderate, Low), and a brief narrative of key themes found.
- Keep it to 3-5 sentences.

AUDIT DATA:
- Audit Title: {audit['audit_title']}
- Opinion: {audit['opinion']}
- Total Issues: {len(issues)}
- High Risk: {len(high)}, Moderate Risk: {len(moderate)}, Low Risk: {len(low)}
- Issues List:
{issue_list}

Generate ONLY the Results paragraph text. No headings, no bullet points."""

def build_background_prompt(audit):
    return f"""You are an internal audit report writer. Rewrite the following Facility/Process Background in a clear, concise, professionally formatted paragraph for an audit report. Use standardized audit-writing guidelines. Keep it factual and professional.

Original Background:
{audit.get('background', '')}

Additional Data Insights:
{audit.get('data_insights', '')}

Generate ONLY the rewritten background paragraph. No headings."""

def build_issues_prompt(issues):
    issues_text = ""
    for i, iss in enumerate(issues):
        issues_text += f"""
Issue #{i+1}:
- Title: {iss.get('issue_title', '')}
- Rating: {iss.get('issue_rating', '')}
- Finding Type: {iss.get('finding_type', '')}
- Issue Description: {iss.get('issue_description', '')}
- Control/Policy: {iss.get('control_policy', '')}
- Remediation Actions: {iss.get('remediation_actions', '')}
- Remediation Owner: {iss.get('remediation_owner', '')}
- Due Date: {iss.get('due_date', '')}
"""
    return f"""You are an internal audit report writer. For each issue below, write a professional, structured issue summary paragraph.

RULES:
- DO NOT change: Issue Title, Issue Rating, Control/Policy, Remediation Owner, Due Date, Exact Findings, Repeat Findings.
- You MAY professionally rewrite: Issue Description, Remediation Actions narrative.
- Use professional audit language. Be concise and clear.
- Format each issue as a separate section.

ISSUES:
{issues_text}

For each issue, output in this format:
**[Issue Title]** | Rating: [Rating]
[Professional issue description paragraph]
Remediation: [Professional remediation narrative]. Owner: [Remediation Owner]. Due: [Due Date].
---"""

@app.post("/api/audits/{audit_id}/generate-report")
async def generate_report(audit_id: int, user=Depends(verify_token)):
    conn = get_db()
    audit = conn.execute("SELECT * FROM audits WHERE id=?", (audit_id,)).fetchone()
    if not audit:
        conn.close()
        raise HTTPException(status_code=404, detail="Audit not found")
    
    audit_dict = dict(audit)
    issues = conn.execute("SELECT * FROM issues WHERE audit_id=?", (audit_id,)).fetchall()
    issues_list = [dict(i) for i in issues]

    # Generate LLM content
    results_para = await call_claude(build_results_prompt(audit_dict, issues_list))
    background_para = await call_claude(build_background_prompt(audit_dict)) if audit_dict.get("background") else ""
    issues_section = await call_claude(build_issues_prompt(issues_list)) if issues_list else ""

    # Save report
    conn.execute(
        """INSERT OR REPLACE INTO audit_reports 
           (audit_id, results_paragraph, facility_background, scope_section, issues_section, generated_at)
           VALUES (?,?,?,?,?,?)""",
        (audit_id, results_para, background_para, audit_dict.get("scope_and_objectives", ""), 
         issues_section, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    return {"message": "Report generated", "audit_id": audit_id}

@app.get("/api/reports/{audit_id}")
def get_report(audit_id: int, user=Depends(verify_token)):
    conn = get_db()
    audit = conn.execute("SELECT * FROM audits WHERE id=?", (audit_id,)).fetchone()
    if not audit:
        conn.close()
        raise HTTPException(status_code=404, detail="Audit not found")
    report = conn.execute("SELECT * FROM audit_reports WHERE audit_id=?", (audit_id,)).fetchone()
    issues = conn.execute("SELECT * FROM issues WHERE audit_id=?", (audit_id,)).fetchall()
    conn.close()
    return {
        "audit": dict(audit),
        "report": dict(report) if report else None,
        "issues": [dict(i) for i in issues]
    }

@app.get("/api/reports")
def list_reports(user=Depends(verify_token)):
    conn = get_db()
    reports = conn.execute("""
        SELECT a.id, a.audit_title, a.opinion, a.created_at, 
               r.generated_at, r.id as report_id
        FROM audits a
        LEFT JOIN audit_reports r ON a.id = r.audit_id
        ORDER BY a.created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in reports]

@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}
