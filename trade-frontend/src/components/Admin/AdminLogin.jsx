// src/components/Admin/AdminLogin.jsx
import React, { useState } from 'react';

// Dynamic API base URL resolution from environment variables or local fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Dedicated Theme Palette for MasterAdmin Portal (Royal Blue)
  const themeAccent = '#2563eb';
  const themeGlow = 'rgba(37, 99, 235, 0.15)';

  const handleQuickFill = () => {
    setEmail('admin@trade.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 🛠️ Safe Endpoint Resolution: Guarantees correct /auth/login concatenation
      const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
      const loginEndpoint = cleanBaseUrl.endsWith('/auth') 
        ? `${cleanBaseUrl}/login` 
        : `${cleanBaseUrl}/auth/login`;

      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          userId: email.trim(),
          password: password.trim(), 
          role: 'ADMIN' 
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Authentication failed.');
      }

      // Extract user payload and verify admin role
      const userData = result.user || result.data || result;
      const userRole = (userData?.role || '').toUpperCase();

      if (userRole !== 'ADMIN' && userRole !== 'MASTER_ADMIN') {
        throw new Error('Access Denied: Account lacks administrative clearance.');
      }

      // Store JWT token if returned
      const token = result.token || result.access_token || userData?.token;
      if (token) {
        localStorage.setItem('adminToken', token);
      }

      if (onLoginSuccess && userData) {
        onLoginSuccess(userData);
      } else {
        throw new Error('Invalid administrative payload received from backend.');
      }

    } catch (err) {
      console.error('Admin Auth Error:', err);
      setError(err.message || 'Unable to complete administrative clearance.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.loginWrapper}>
      <div style={{ ...styles.ambientGlowTop, background: `radial-gradient(circle, ${themeGlow} 0%, rgba(255, 255, 255, 0) 70%)` }}></div>

      <div style={{ ...styles.loginCard, border: `2px solid ${themeAccent}`, boxShadow: `0 12px 32px rgba(0, 0, 0, 0.08), 0 0 16px ${themeGlow}` }}>
        <div style={styles.brandHeader}>
          <div style={{ ...styles.logoBadge, backgroundColor: themeAccent, boxShadow: `0 4px 14px ${themeGlow}` }}>
            🛡️
          </div>
          <h2 style={styles.title}>MasterAdmin Portal</h2>
          <p style={styles.subtitle}>Security Clearance Required to Access Admin Workspace</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '14px' }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email or User ID</label>
            <input 
              type="text" 
              required
              disabled={isLoading}
              placeholder="admin@trade.com or ADM-1001"
              value={email}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? { borderColor: themeAccent, boxShadow: `0 0 8px ${themeGlow}` } : {})
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Secret Access Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                disabled={isLoading}
                placeholder="••••••••••••"
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...styles.input,
                  paddingRight: '40px',
                  ...(focusedField === 'password' ? { borderColor: themeAccent, boxShadow: `0 0 8px ${themeGlow}` } : {})
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ 
              ...styles.submitBtn, 
              backgroundColor: themeAccent,
              color: '#ffffff',
              boxShadow: `0 4px 14px ${themeGlow}`,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'VERIFYING SECURITY CLEARANCE...' : 'Authenticate & Enter Workspace'}
          </button>

          <button 
            type="button" 
            onClick={handleQuickFill} 
            disabled={isLoading}
            style={styles.demoFillBtn}
          >
            ⚡ Quick Seed Admin Credentials
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loginWrapper: { 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px 16px', 
    flex: 1,
    overflowY: 'auto', 
    backgroundColor: '#ffffff',
    color: '#0f172a',
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box'
  },
  ambientGlowTop: {
    position: 'absolute',
    top: '-10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '500px',
    height: '500px',
    zIndex: 1,
    pointerEvents: 'none',
    transition: 'background 0.3s ease'
  },
  loginCard: { 
    position: 'relative',
    zIndex: 10,
    width: '100%', 
    maxWidth: '440px', 
    backgroundColor: '#ffffff', 
    borderRadius: '16px', 
    padding: '28px 24px', 
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    margin: 'auto 0'
  },
  brandHeader: { textAlign: 'center', marginBottom: '24px' },
  logoBadge: { 
    height: '44px', 
    width: '44px', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '20px', 
    margin: '0 auto 12px',
    transition: 'all 0.3s ease'
  },
  title: { fontSize: '20px', fontWeight: '900', margin: '0 0 6px', color: '#0f172a', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.75px' },
  input: { 
    padding: '12px 14px', 
    borderRadius: '8px', 
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#cbd5e1', 
    backgroundColor: '#ffffff', 
    color: '#0f172a', 
    fontSize: '14px', 
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    width: '100%'
  },
  errorAlert: { 
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fff1f2', 
    border: '1px solid #fecdd3', 
    color: '#e11d48', 
    padding: '10px 14px', 
    borderRadius: '8px', 
    fontSize: '12px',
    fontWeight: '700',
    lineHeight: '1.4',
    marginBottom: '16px'
  },
  submitBtn: { 
    border: 'none', 
    padding: '12px', 
    borderRadius: '8px', 
    fontSize: '12px', 
    fontWeight: '800', 
    marginTop: '4px',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  demoFillBtn: { 
    background: '#f8fafc', 
    border: '1px dashed #cbd5e1', 
    color: '#2563eb', 
    padding: '10px', 
    borderRadius: '8px', 
    fontSize: '11px', 
    fontWeight: '800',
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};