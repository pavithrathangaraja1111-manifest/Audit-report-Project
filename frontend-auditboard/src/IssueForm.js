import React from 'react';

const s = {
  card: {
    background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10,
    padding: 20, marginBottom: 16
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontWeight: 700, color: '#2d3748', fontSize: 15 },
  delBtn: {
    background: '#fff5f5', color: '#e53e3e', border: '1px solid #feb2b2',
    borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer'
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  full: { gridColumn: '1/-1' },
  label: { fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4, display: 'block' },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #cbd5e0',
    borderRadius: 6, fontSize: 14, outline: 'none'
  },
  textarea: {
    width: '100%', padding: '9px 12px', border: '1px solid #cbd5e0',
    borderRadius: 6, fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80
  },
  select: {
    width: '100%', padding: '9px 12px', border: '1px solid #cbd5e0',
    borderRadius: 6, fontSize: 14, outline: 'none', background: '#fff'
  }
};

const Field = ({ label, children, full }) => (
  <div style={full ? { ...s.full } : {}}>
    <label style={s.label}>{label}</label>
    {children}
  </div>
);

export default function IssueForm({ issue, index, onChange, onDelete }) {
  const upd = (field, val) => onChange(index, { ...issue, [field]: val });

  return (
    <div style={s.card}>
      <div style={s.header}>
        <span style={s.title}>Issue #{index + 1}</span>
        <button style={s.delBtn} onClick={() => onDelete(index)}>Remove</button>
      </div>
      <div style={s.grid}>
        <Field label="Issue Title *" full>
          <input style={s.input} value={issue.issue_title || ''}
            onChange={e => upd('issue_title', e.target.value)} placeholder="Enter issue title" />
        </Field>
        <Field label="Issue Rating *">
          <select style={s.select} value={issue.issue_rating || ''}
            onChange={e => upd('issue_rating', e.target.value)}>
            <option value="">Select rating</option>
            <option>High</option>
            <option>Moderate</option>
            <option>Low</option>
          </select>
        </Field>
        <Field label="Finding Type">
          <select style={s.select} value={issue.finding_type || ''}
            onChange={e => upd('finding_type', e.target.value)}>
            <option value="">Select type</option>
            <option>SOX Control</option>
            <option>Process Control</option>
            <option>Policy/Procedure</option>
            <option>Audit Step</option>
            <option>Plant Audit Theme</option>
          </select>
        </Field>
        <Field label="Issue Cycle">
          <select style={s.select} value={issue.issue_cycle || ''}
            onChange={e => upd('issue_cycle', e.target.value)}>
            <option value="">Select cycle</option>
            <option>Company Liabilities & Risks</option>
            <option>Employee Benefits</option>
            <option>Entity Level Control</option>
            <option>Financial Reporting & Consolidation</option>
            <option>Fixed Assets</option>
            <option>Information Technology</option>
            <option>Inventory</option>
            <option>Investments</option>
          </select>
        </Field>
        <Field label="Exact Findings *" full>
          <textarea style={s.textarea} value={issue.exact_findings || ''}
            onChange={e => upd('exact_findings', e.target.value)}
            placeholder="Enter exact findings as observed..." />
        </Field>
        <Field label="Repeat Findings">
          <select style={s.select} value={issue.repeat_findings || ''}
            onChange={e => upd('repeat_findings', e.target.value)}>
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </Field>
        <Field label="Issue Description" full>
          <textarea style={s.textarea} value={issue.issue_description || ''}
            onChange={e => upd('issue_description', e.target.value)}
            placeholder="Describe the issue in detail..." />
        </Field>
        <Field label="Control / Policy" full>
          <textarea style={{ ...s.textarea, minHeight: 60 }} value={issue.control_policy || ''}
            onChange={e => upd('control_policy', e.target.value)}
            placeholder="Relevant control or policy..." />
        </Field>
        <Field label="Remediation Actions" full>
          <textarea style={s.textarea} value={issue.remediation_actions || ''}
            onChange={e => upd('remediation_actions', e.target.value)}
            placeholder="Describe remediation steps..." />
        </Field>
        <Field label="Remediation Owner">
          <input style={s.input} value={issue.remediation_owner || ''}
            onChange={e => upd('remediation_owner', e.target.value)} placeholder="Owner name/team" />
        </Field>
        <Field label="Due Date">
          <input style={s.input} type="date" value={issue.due_date || ''}
            onChange={e => upd('due_date', e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
