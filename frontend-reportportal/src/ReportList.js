import React, { useState, useEffect } from 'react';
import { getReports, generateReport } from './api';

const ff = 'Segoe UI, Tahoma, sans-serif';

export default function ReportList({ onSelect }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    getReports().then(r => { setReports(r.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async (id, e) => {
    e.stopPropagation();
    setGenerating(id);
    try {
      await generateReport(id);
      setMsg('Report generated successfully!');
      setTimeout(() => { setMsg(''); load(); }, 2000);
    } catch { alert('Failed to generate report'); }
    finally { setGenerating(null); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: ff }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c3e50' }}>Audit Report Portal</h1>
        <p style={{ fontSize: 14, color: '#7f8c8d', marginTop: 4 }}>
          AI-generated audit reports — click any audit to view its full report
        </p>
      </div>

      {msg && (
        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
          ✅ {msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#95a5a6' }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#95a5a6' }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ marginTop: 12 }}>No audits found. Create audits in the Audit Board first.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {reports.map(r => (
            <div key={r.id}
              onClick={() => r.report_id && onSelect(r.id)}
              style={{
                background: '#fff', borderRadius: 12, padding: '20px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: r.report_id ? '1px solid #d5e8d4' : '1px solid #e2e8f0',
                cursor: r.report_id ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s, transform 0.15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
              onMouseEnter={e => { if (r.report_id) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = ''; }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#2c3e50' }}>{r.audit_title}</div>
                <div style={{ fontSize: 13, color: '#7f8c8d', marginTop: 4 }}>
                  Audit #{r.id} &nbsp;•&nbsp; Created: {new Date(r.created_at).toLocaleDateString()}
                  {r.generated_at && <> &nbsp;•&nbsp; Report: {new Date(r.generated_at).toLocaleDateString()}</>}
                </div>
                {r.opinion && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: r.opinion === 'Satisfactory' ? '#d4edda' : r.opinion === 'Outstanding' ? '#cce5ff' : '#fff3cd',
                      color: r.opinion === 'Satisfactory' ? '#155724' : r.opinion === 'Outstanding' ? '#004085' : '#856404'
                    }}>{r.opinion}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {r.report_id ? (
                  <span style={{ fontSize: 13, color: '#27ae60', fontWeight: 600 }}>✅ View Report →</span>
                ) : (
                  <button
                    onClick={e => handleGenerate(r.id, e)}
                    disabled={generating === r.id}
                    style={{
                      background: '#3498db', color: '#fff', border: 'none', borderRadius: 8,
                      padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {generating === r.id ? '⏳ Generating...' : '🤖 Generate Report'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
