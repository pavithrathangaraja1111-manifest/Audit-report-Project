import React, { useState } from 'react';
import { login } from './api';

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)'
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '48px 40px',
    width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  logo: {
    textAlign: 'center', marginBottom: 32,
  },
  logoIcon: {
    fontSize: 48, marginBottom: 8
  },
  title: { fontSize: 28, fontWeight: 700, color: '#1e3a5f', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#718096', textAlign: 'center', marginTop: 4, marginBottom: 32 },
  label: { fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0',
    borderRadius: 8, fontSize: 15, outline: 'none', transition: 'border-color 0.2s',
    marginBottom: 16
  },
  btn: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)',
    color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
    cursor: 'pointer', marginTop: 8
  },
  error: {
    background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030',
    padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16
  },
  hint: { fontSize: 12, color: '#a0aec0', textAlign: 'center', marginTop: 16 }
};

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
      localStorage.setItem('role', res.data.role);
      onLogin(res.data);
    } catch {
      setError('Invalid username or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏛️</div>
          <div style={styles.title}>Audit Board</div>
          <div style={styles.subtitle}>Internal Audit Management System</div>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Username</label>
          <input style={styles.input} value={username}
            onChange={e => setUsername(e.target.value)} placeholder="Enter username" required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.hint}>Default: auditor / audit123</div>
      </div>
    </div>
  );
}
