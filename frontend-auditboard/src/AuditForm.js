import React, { useState, useEffect } from 'react';
import { createAudit, updateAudit, getAudit, generateReport } from './api';
import IssueForm from './IssueForm';

const s = {
  container: { maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  card: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 },
  sectionTitle: {
    fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 20,
    paddingBottom: 12, borderBottom: '2px solid #ebf4ff', display: 'flex', alignItems: 'center', gap: 8
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  full: { gridColumn: '1/-1' },
  label: { fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 5, display: 'block' },
  req: { color: '#e53e3e' },
  input: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
  },
  textarea: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 100
  },
  select: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff'
  },
  addIssueBtn: {
    background: '#ebf8ff', color: '#2b6cb0', border: '2px dashed #90cdf4',
    borderRadius: 10, padding: '14px', width: '100%', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginBottom: 16
  },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  saveBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer'
  },
  genBtn: {
    background: '#38a169', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer'
  },
  cancelBtn: {
    background: '#f7fafc', color: '#4a5568', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '12px 24px', fontSize: 15, cursor: 'pointer'
  },
  success: {
    background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749',
    padding: '12px 16px', borderRadius: 8, marginBottom: 16
  },
  error: {
    background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030',
    padding: '12px 16px', borderRadius: 8, marginBottom: 16
  }
};

const emptyIssue = () => ({
  issue_title: '', issue_rating: '', finding_type: '', issue_cycle: '',
  exact_findings: '', repeat_findings: '', issue_description: '', control_policy: '',
  remediation_actions: '', remediation_owner: '', due_date: ''
});

export default function AuditForm({ auditId, onBack, onSaved }) {
  const [form, setForm] = useState({
    audit_title: '', opinion: '', scope_and_objectives: '',
    background: '', data_insights: '', other_observations: ''
  });
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const isEdit = !!auditId;

  useEffect(() => {
    if (isEdit) {
      getAudit(auditId).then(res => {
        const { issues: iss, ...audit } = res.data;
        setForm(audit);
        setIssues(iss || []);
      });
    }
  }, [auditId, isEdit]);

  const upd = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const addIssue = () => setIssues(i => [...i, emptyIssue()]);
  const removeIssue = idx => setIssues(i => i.filter((_, j) => j !== idx));
  const changeIssue = (idx, val) => setIssues(i => i.map((x, j) => j === idx ? val : x));

  const handleSave = async () => {
    if (!form.audit_title.trim()) { setErr('Audit title is required'); return; }
    setLoading(true); setErr(''); setMsg('');
    try {
      const payload = { ...form, issues };
      if (isEdit) await updateAudit(auditId, payload);
      else await createAudit(payload);
      setMsg(isEdit ? 'Audit updated successfully!' : 'Audit created successfully!');
      setTimeout(() => onSaved && onSaved(), 1200);
    } catch { setErr('Failed to save audit. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!auditId) { setErr('Please save the audit first before generating a report.'); return; }
    setGenerating(true); setErr(''); setMsg('');
    try {
      await generateReport(auditId);
      setMsg('Report generated! Check the Audit Report Portal.');
    } catch { setErr('Failed to generate report.'); }
    finally { setGenerating(false); }
  };

  const Field = ({ label, req, children, full }) => (
    <div style={full ? s.full : {}}>
      <label style={s.label}>{label} {req && <span style={s.req}>*</span>}</label>
      {children}
    </div>
  );

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ ...s.cancelBtn, padding: '8px 16px' }}>← Back</button>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f' }}>
          {isEdit ? 'Edit Audit' : 'Create New Audit'}
        </h2>
      </div>

      {msg && <div style={s.success}>✅ {msg}</div>}
      {err && <div style={s.error}>⚠️ {err}</div>}

      {/* Section 1: Audit Info */}
      <div style={s.card}>
        <div style={s.sectionTitle}>📋 Audit Information</div>
        <div style={s.grid}>
          <Field label="Audit Title" req full>
            <input style={s.input} value={form.audit_title}
              onChange={e => upd('audit_title', e.target.value)} placeholder="Enter audit title" />
          </Field>
          <Field label="Opinion" full>
            <select style={s.select} value={form.opinion}
              onChange={e => upd('opinion', e.target.value)}>
              <option value="">Select opinion</option>
              <option>Satisfactory</option>
              <option>Needs Improvement</option>
              <option>Unsatisfactory</option>
              <option>Outstanding</option>
            </select>
          </Field>
          <Field label="Scope and Objectives" full>
            <textarea style={s.textarea} value={form.scope_and_objectives}
              onChange={e => upd('scope_and_objectives', e.target.value)}
              placeholder="Define the scope and objectives of this audit..." />
          </Field>
        </div>
      </div>

      {/* Section 2: Background & Data */}
      <div style={s.card}>
        <div style={s.sectionTitle}>📊 Background & Data Insights</div>
        <div style={s.grid}>
          <Field label="Background" full>
            <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.background}
              onChange={e => upd('background', e.target.value)}
              placeholder="Facility/process background information..." />
          </Field>
          <Field label="Data Insights" full>
            <textarea style={s.textarea} value={form.data_insights}
              onChange={e => upd('data_insights', e.target.value)}
              placeholder="Key data insights and analytics..." />
          </Field>
          <Field label="Other Observations" full>
            <textarea style={s.textarea} value={form.other_observations}
              onChange={e => upd('other_observations', e.target.value)}
              placeholder="Additional observations..." />
          </Field>
        </div>
      </div>

      {/* Section 3: Issues */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          🔍 Audit Issues
          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 400, color: '#718096' }}>
            {issues.length} issue(s)
          </span>
        </div>
        {issues.map((issue, idx) => (
          <IssueForm key={idx} issue={issue} index={idx}
            onChange={changeIssue} onDelete={removeIssue} />
        ))}
        <button style={s.addIssueBtn} onClick={addIssue}>
          ＋ Add New Issue
        </button>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.cancelBtn} onClick={onBack}>Cancel</button>
        {isEdit && (
          <button style={s.genBtn} onClick={handleGenerate} disabled={generating}>
            {generating ? '⏳ Generating...' : '🤖 Generate Report'}
          </button>
        )}
        <button style={s.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : isEdit ? '💾 Update Audit' : '💾 Create Audit'}
        </button>
      </div>
    </div>
  );
}
