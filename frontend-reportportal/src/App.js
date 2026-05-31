import React, { useState } from 'react';
import LoginPage from './LoginPage';
import ReportList from './ReportList';
import ReportView from './ReportView';

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('username');
    const t = localStorage.getItem('token');
    return u && t ? { username: u } : null;
  });
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  const logout = () => { localStorage.clear(); setUser(null); };

  if (!user) return <LoginPage onLogin={u => setUser(u)} />;

  if (selectedAuditId) {
    return <ReportView auditId={selectedAuditId} onBack={() => setSelectedAuditId(null)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <div style={{
        background: '#2c3e50', padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'Segoe UI' }}>
          📄 Audit Report Portal
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Segoe UI' }}>
            👤 {user.username}
          </span>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'Segoe UI'
          }}>Logout</button>
        </div>
      </div>
      <ReportList onSelect={id => setSelectedAuditId(id)} />
    </div>
  );
}
