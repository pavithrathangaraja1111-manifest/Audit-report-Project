import React, { useState, useEffect } from 'react';
import { getAudits, deleteAudit, generateReport } from './api';

const s = {
  container: { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#1e3a5f' },
  newBtn: {
    background: '#1e3a5f', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer'
  },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid'
  },
  statNum: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#718096', marginTop: 6 },
  table: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  tableHeader: {
    background: '#1e3a5f', color: '#fff', fontSize: 13, fontWeight: 600,
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '14px 20px', gap: 12
  },
  row: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
    padding: '16px 20px', gap: 12, borderBottom: '1px solid #f0f4f8',
    alignItems: 'center', transition: 'background 0.15s'
  },
  auditTitle: { fontWeight: 600, color: '#2d3748', fontSize: 15 },
  auditMeta: { fontSize: 12, color: '#a0aec0', marginTop: 2 },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
  },
  actions: { display: 'flex', gap: 8 },
  editBtn: {
    background: '#ebf8ff', color: '#2b6cb0', border: 'none',
    borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600
  },
  genBtn: {
    background: '#f0fff4', color: '#276749', border: 'none',
    borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600
  },
  delBtn: {
    background: '#fff5f5', color: '#c53030', border: 'none',
    borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600
  },
  empty: { textAlign: 'center', padding: '48px 24px', color: '#a0aec0' },
  filterBar: { display: 'flex', gap: 12, marginBottom: 16 },
  search: {
    flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 14, outline: 'none'
  },
  msg: {
    background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749',
    padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14
  }
};

const opinionColor = {
  'Satisfactory': '#38a169', 'Outstanding': '#2b6cb0',
  'Needs Improvement': '#d69e2e', 'Unsatisfactory': '#e53e3e'
};

const opinionBg = {
  'Satisfactory': '#f0fff4', 'Outstanding': '#ebf8ff',
  'Needs Improvement': '#fffff0', 'Unsatisfactory': '#fff5f5'
};

export default function AuditList({ onEdit, onNew }) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(null);

  const load = () => {
    setLoading(true);
    getAudits().then(res => { setAudits(res.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete audit "${title}"?`)) return;
    await deleteAudit(id);
    load();
  };

  const handleGenerate = async (id) => {
    setGenerating(id);
    try {
      await generateReport(id);
      setMsg('✅ Report generated! Check the Audit Report Portal (port 3001).');
      setTimeout(() => setMsg(''), 4000);
    } catch { alert('Failed to generate report'); }
    finally { setGenerating(null); }
  };

  const filtered = audits.filter(a =>
    a.audit_title.toLowerCase().includes(search.toLowerCase())
  );

  const totalIssues = audits.reduce((sum, a) => sum + (a.issues?.length || 0), 0);
  const withReports = audits.filter(a => a.has_report).length;
  const highRisk = audits.reduce((sum, a) =>
    sum + (a.issues?.filter(i => i.issue_rating === 'High').length || 0), 0);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <div style={s.title}>📋 Audit Board</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Manage all internal audits</div>
        </div>
        <button style={s.newBtn} onClick={onNew}>＋ New Audit</button>
      </div>

      {msg && <div style={s.msg}>{msg}</div>}

      {/* Stats */}
      <div style={s.stats}>
        {[
          { num: audits.length, label: 'Total Audits', color: '#1e3a5f', bg: '#ebf4ff' },
          { num: totalIssues, label: 'Total Issues', color: '#d69e2e', bg: '#fffff0' },
          { num: highRisk, label: 'High Risk Issues', color: '#e53e3e', bg: '#fff5f5' },
          { num: withReports, label: 'Reports Generated', color: '#38a169', bg: '#f0fff4' },
        ].map((s2, i) => (
          <div key={i} style={{ ...s.statCard, borderLeftColor: s2.color, background: s2.bg }}>
            <div style={{ ...s.statNum, color: s2.color }}>{s2.num}</div>
            <div style={s.statLabel}>{s2.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={s.filterBar}>
        <input style={s.search} placeholder="🔍 Search audits..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div style={s.table}>
        <div style={s.tableHeader}>
          <span>Audit</span><span>Opinion</span><span>Issues</span>
          <span>Report</span><span>Created</span><span>Actions</span>
        </div>
        {loading ? (
          <div style={s.empty}>Loading audits...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div>No audits found. Create your first audit!</div>
          </div>
        ) : filtered.map(audit => (
          <div key={audit.id} style={s.row}
            onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            <div>
              <div style={s.auditTitle}>{audit.audit_title}</div>
              <div style={s.auditMeta}>#{audit.id} • by {audit.created_by}</div>
            </div>
            <div>
              {audit.opinion ? (
                <span style={{
                  ...s.badge,
                  color: opinionColor[audit.opinion] || '#4a5568',
                  background: opinionBg[audit.opinion] || '#f7fafc'
                }}>{audit.opinion}</span>
              ) : <span style={{ color: '#a0aec0', fontSize: 13 }}>—</span>}
            </div>
            <div style={{ fontWeight: 600, color: '#4a5568' }}>{audit.issues?.length || 0}</div>
            <div>
              {audit.has_report
                ? <span style={{ ...s.badge, background: '#f0fff4', color: '#276749' }}>✅ Generated</span>
                : <span style={{ ...s.badge, background: '#f7fafc', color: '#a0aec0' }}>—</span>}
            </div>
            <div style={{ fontSize: 13, color: '#718096' }}>
              {new Date(audit.created_at).toLocaleDateString()}
            </div>
            <div style={s.actions}>
              <button style={s.editBtn} onClick={() => onEdit(audit.id)}>Edit</button>
              <button style={s.genBtn} onClick={() => handleGenerate(audit.id)}
                disabled={generating === audit.id}>
                {generating === audit.id ? '⏳' : '🤖'}
              </button>
              <button style={s.delBtn} onClick={() => handleDelete(audit.id, audit.audit_title)}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
