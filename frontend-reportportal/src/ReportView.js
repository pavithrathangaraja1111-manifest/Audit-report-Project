import React, { useState, useEffect } from 'react';
import { getReport } from './api';

const ratingColor = {
  High: { bg: '#fdecea', text: '#c0392b', border: '#e74c3c' },
  Moderate: { bg: '#fef9e7', text: '#d35400', border: '#f39c12' },
  Low: { bg: '#eafaf1', text: '#1e8449', border: '#27ae60' }
};

const pageStyle = {
  background: '#f5f5f0', minHeight: '100vh', fontFamily: 'Georgia, serif'
};

const docStyle = {
  maxWidth: 860, margin: '0 auto', background: '#fff',
  padding: '60px 72px', boxShadow: '0 4px 30px rgba(0,0,0,0.12)', minHeight: '100vh'
};

const sectionTitle = {
  fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
  color: '#2c3e50', borderBottom: '2px solid #2c3e50', paddingBottom: 8, marginBottom: 16, marginTop: 36
};

const bodyText = {
  fontSize: 14, lineHeight: 1.8, color: '#2c3e50', textAlign: 'justify', fontFamily: 'Georgia, serif'
};

const highlight = { background: '#fffbf0', borderLeft: '4px solid #f39c12', padding: '12px 16px', borderRadius: 4 };

export default function ReportView({ auditId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(auditId).then(r => { setData(r.data); setLoading(false); });
  }, [auditId]);

  if (loading) return (
    <div style={{ ...pageStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontFamily: 'Segoe UI', fontSize: 18, color: '#7f8c8d' }}>
        ⏳ Loading report...
      </div>
    </div>
  );

  if (!data || !data.report) return (
    <div style={{ ...pageStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <div style={{ fontFamily: 'Segoe UI', fontSize: 18, color: '#7f8c8d' }}>No report generated yet.</div>
      <button onClick={onBack} style={{ fontFamily: 'Segoe UI', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer' }}>
        Back to List
      </button>
    </div>
  );

  const { audit, report, issues } = data;
  const highIssues = issues.filter(i => i.issue_rating === 'High');
  const modIssues = issues.filter(i => i.issue_rating === 'Moderate');
  const lowIssues = issues.filter(i => i.issue_rating === 'Low');

  const handlePrint = () => window.print();

  return (
    <div style={pageStyle}>
      {/* Toolbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#2c3e50',
        padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontFamily: 'Segoe UI, sans-serif'
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
          borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer'
        }}>← Back to Reports</button>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, flex: 1 }}>
          📄 {audit.audit_title}
        </span>
        <button onClick={handlePrint} style={{
          background: '#3498db', color: '#fff', border: 'none',
          borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600
        }}>🖨️ Print / PDF</button>
      </div>

      <div style={docStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '3px solid #2c3e50', paddingBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#7f8c8d', textTransform: 'uppercase', fontFamily: 'Segoe UI' }}>
            Internal Audit Report
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2c3e50', marginTop: 12, marginBottom: 8, fontFamily: 'Segoe UI' }}>
            {audit.audit_title}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16, fontFamily: 'Segoe UI', fontSize: 13, color: '#7f8c8d' }}>
            <span>Date: <strong>{new Date(audit.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            <span>Prepared by: <strong>{audit.created_by || 'Internal Audit'}</strong></span>
            {report.generated_at && <span>Report generated: <strong>{new Date(report.generated_at).toLocaleDateString()}</strong></span>}
          </div>
        </div>

        {/* Opinion */}
        {audit.opinion && (
          <div style={{ ...highlight, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#7f8c8d', fontFamily: 'Segoe UI', fontWeight: 700 }}>
                Audit Opinion
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2c3e50', fontFamily: 'Segoe UI', marginTop: 4 }}>
                {audit.opinion}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {report.results_paragraph && (
          <>
            <div style={sectionTitle}>Results</div>
            <p style={bodyText}>{report.results_paragraph}</p>
          </>
        )}

        {/* Scope & Objectives */}
        {audit.scope_and_objectives && (
          <>
            <div style={sectionTitle}>Scope and Objectives</div>
            <p style={bodyText}>{audit.scope_and_objectives}</p>
          </>
        )}

        {/* Facility Background */}
        {report.facility_background && (
          <>
            <div style={sectionTitle}>Facility Background</div>
            <p style={bodyText}>{report.facility_background}</p>
          </>
        )}

        {/* Issue Summary Table */}
        {issues.length > 0 && (
          <>
            <div style={sectionTitle}>Issue Summary</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Segoe UI, sans-serif', fontSize: 13, marginBottom: 8 }}>
              <thead>
                <tr style={{ background: '#2c3e50', color: '#fff' }}>
                  {['#', 'Issue Title', 'Rating', 'Finding Type', 'Repeat', 'Owner', 'Due Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.map((iss, idx) => {
                  const rc = ratingColor[iss.issue_rating] || { bg: '#f5f5f5', text: '#333', border: '#ccc' };
                  return (
                    <tr key={iss.id} style={{ background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '9px 12px', color: '#7f8c8d' }}>{idx + 1}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 600 }}>{iss.issue_title}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ background: rc.bg, color: rc.text, padding: '2px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                          {iss.issue_rating}
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px', color: '#555' }}>{iss.finding_type}</td>
                      <td style={{ padding: '9px 12px', color: iss.repeat_findings === 'Yes' ? '#c0392b' : '#555' }}>
                        {iss.repeat_findings || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', color: '#555' }}>{iss.remediation_owner || '—'}</td>
                      <td style={{ padding: '9px 12px', color: '#555' }}>{iss.due_date || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* Detailed Issues */}
        {report.issues_section && (
          <>
            <div style={sectionTitle}>Detailed Findings</div>
            <div style={{ fontFamily: 'Segoe UI, sans-serif' }}>
              {report.issues_section.split('---').filter(s => s.trim()).map((section, idx) => {
                const lines = section.trim().split('\n');
                const titleLine = lines[0] || '';
                const rest = lines.slice(1).join('\n').trim();
                // Parse title and rating from bold line
                const titleMatch = titleLine.match(/\*\*(.+?)\*\*\s*\|\s*Rating:\s*(.+)/);
                const issTitle = titleMatch ? titleMatch[1] : titleLine.replace(/\*\*/g, '');
                const issRating = titleMatch ? titleMatch[2].trim() : '';
                const rc = ratingColor[issRating] || { bg: '#f5f5f5', text: '#333', border: '#ccc' };

                return (
                  <div key={idx} style={{
                    marginBottom: 28, borderRadius: 8, overflow: 'hidden',
                    border: `1px solid ${rc.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ background: rc.bg, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#2c3e50' }}>
                        Issue {idx + 1}: {issTitle}
                      </div>
                      {issRating && (
                        <span style={{ background: '#fff', color: rc.text, border: `1px solid ${rc.border}`, padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {issRating} Risk
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '16px 18px' }}>
                      {rest.split('\n').map((line, li) => (
                        line.trim() ? <p key={li} style={{ ...bodyText, marginBottom: 8, fontFamily: 'Segoe UI, sans-serif' }}>{line.trim()}</p> : null
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Exact findings (preserved) for each issue */}
        {issues.some(i => i.exact_findings) && (
          <>
            <div style={sectionTitle}>Exact Findings (Preserved)</div>
            {issues.filter(i => i.exact_findings).map((iss, idx) => (
              <div key={idx} style={{ marginBottom: 16, padding: '14px 18px', background: '#f8f9fa', borderRadius: 8, borderLeft: '4px solid #2c3e50' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, fontFamily: 'Segoe UI' }}>
                  {iss.issue_title}
                </div>
                <div style={bodyText}>{iss.exact_findings}</div>
                {iss.control_policy && (
                  <div style={{ marginTop: 8, fontSize: 13, color: '#7f8c8d', fontFamily: 'Segoe UI' }}>
                    <strong>Control/Policy:</strong> {iss.control_policy}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 24, borderTop: '2px solid #ecf0f1', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif', fontSize: 12, color: '#95a5a6' }}>
          <div>Internal Audit Report — Confidential</div>
          <div style={{ marginTop: 4 }}>Generated by Audit Management System • {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
