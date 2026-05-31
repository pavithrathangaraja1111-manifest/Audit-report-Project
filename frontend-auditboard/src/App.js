import React, { useState } from 'react';
import LoginPage from './LoginPage';
import AuditList from './AuditList';
import AuditForm from './AuditForm';

const NAV_H = 64;

const navStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, height: NAV_H, zIndex: 100,
  background: '#1e3a5f', display: 'flex', alignItems: 'center',
  padding: '0 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};

const tabs = ['Create New Audit', 'View Existing'];

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('username');
    const t = localStorage.getItem('token');
    return u && t ? { username: u } : null;
  });
  const [tab, setTab] = useState(1);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState('list');

  const logout = () => { localStorage.clear(); setUser(null); };

  if (!user) return <LoginPage onLogin={u => setUser(u)} />;

  const goList = () => { setView('list'); setEditId(null); setTab(1); };
  const goNew = () => { setView('form'); setEditId(null); setTab(0); };
  const goEdit = id => { setView('form'); setEditId(id); };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={navStyle}>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>
          🏛️ Audit Board
        </span>
        <div style={{ display: 'flex', gap: 4, marginLeft: 48 }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => { setTab(i); i === 0 ? goNew() : goList(); }}
              style={{
                background: tab === i ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '8px 18px', fontSize: 14, fontWeight: tab === i ? 700 : 400,
                cursor: 'pointer'
              }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>👤 {user.username}</span>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer'
          }}>Logout</button>
        </div>
      </div>
      <div style={{ paddingTop: NAV_H + 16 }}>
        {view === 'list'
          ? <AuditList onEdit={goEdit} onNew={goNew} />
          : <AuditForm auditId={editId} onBack={goList} onSaved={goList} />
        }
      </div>
    </div>
  );
}
