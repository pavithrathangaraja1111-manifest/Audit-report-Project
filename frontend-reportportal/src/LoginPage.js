import React, { useState } from 'react';
import { login } from './api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(username, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      onLogin(res.data);
    } catch {
      setError('Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px', width: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52 }}>📄</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#2c3e50', fontFamily: 'Segoe UI', marginTop: 8 }}>
            Audit Report Portal
          </div>
          <div style={{ fontSize: 13, color: '#7f8c8d', marginTop: 4 }}>
            AI-Powered Audit Reports
          </div>
        </div>
        {error && (
          <div style={{ background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {['Username', 'Password'].map((label, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6, fontFamily: 'Segoe UI' }}>
                {label}
              </label>
              <input
                type={i === 1 ? 'password' : 'text'}
                value={i === 0 ? username : password}
                onChange={e => i === 0 ? setUsername(e.target.value) : setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0',
                  borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Segoe UI'
                }}
                placeholder={`Enter ${label.toLowerCase()}`}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 14, background: '#2c3e50', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
            fontFamily: 'Segoe UI', marginTop: 8, cursor: 'pointer'
          }}>
            {loading ? 'Signing in...' : 'Access Reports'}
          </button>
        </form>
        <div style={{ fontSize: 12, color: '#a0aec0', textAlign: 'center', marginTop: 16, fontFamily: 'Segoe UI' }}>
          Default: auditor / audit123
        </div>
      </div>
    </div>
  );
}
