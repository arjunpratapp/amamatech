import React, { useState, useEffect } from 'react';

// Dynamic API base URL resolution from environment variables or local fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Login({ onLoginSuccess, initialEmail = '', initialRole = 'SUPPLIER', onNavigateToOnboarding }) {
  const [role, setRole] = useState(initialRole); // 'SUPPLIER' or 'BUYER'
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Sync initial props when passed from Onboarding
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      if (initialEmail.startsWith('sup_')) setRole('SUPPLIER');
      if (initialEmail.startsWith('buy_')) setRole('BUYER');
    }
    if (initialRole) setRole(initialRole);
  }, [initialEmail, initialRole]);

  // Dynamic Signature themes mapped to role selection
  const themeAccent = role === 'SUPPLIER' ? '#d97706' : '#db2777';
  const themeGlow = role === 'SUPPLIER' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(219, 39, 119, 0.15)';

  const handleQuickFill = () => {
    if (role === 'SUPPLIER') {
      setEmail('ops@amamaexporters.com');
      setPassword('supplier123');
    } else {
      setEmail('procurement@globalbuy.de');
      setPassword('buyer123');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loginEndpoint = `${API_BASE_URL.replace('/auth', '')}/auth/login`;

      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          userId: email.trim(), 
          password, 
          role 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Authentication failed.');
      }

      // Safely extract the user payload whether it's result.user or result directly
      const userData = result.user || result.data || result;

      // Extract token if provided
      const token = result.token || result.access_token || userData?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Trigger state change in App.jsx to cause the workspace redirect
      if (onLoginSuccess && userData) {
        onLoginSuccess(userData);
      } else {
        throw new Error('Invalid user payload received from backend.');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Unable to complete authentication.');
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
            {role === 'SUPPLIER' ? '🚢' : '🛒'}
          </div>
          <h2 style={styles.title}>Secure Trade Portal</h2>
          <p style={styles.subtitle}>Unified Clearing &amp; Regulatory Escrow Environment</p>
        </div>

        <div style={styles.portalToggleContainer}>
          <button 
            type="button" 
            onClick={() => { setRole('SUPPLIER'); setError(''); }} 
            style={{
              ...styles.toggleBtn, 
              ...(role === 'SUPPLIER' ? styles.activeToggleBtn : {}),
              color: role === 'SUPPLIER' ? '#d97706' : '#64748b',
              borderColor: role === 'SUPPLIER' ? '#d97706' : 'transparent'
            }}
          >
            Supplier Desk
          </button>
          <button 
            type="button" 
            onClick={() => { setRole('BUYER'); setError(''); }} 
            style={{
              ...styles.toggleBtn, 
              ...(role === 'BUYER' ? styles.activeToggleBtn : {}),
              color: role === 'BUYER' ? '#db2777' : '#64748b',
              borderColor: role === 'BUYER' ? '#db2777' : 'transparent'
            }}
          >
            Buyer Desk
          </button>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={{ fontSize: '14px' }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Corporate Email / Mobile / User ID</label>
            <input 
              type="text" 
              required
              disabled={isLoading}
              placeholder={role === 'SUPPLIER' ? 'sup_178549... or ops@amama.com' : 'buy_178549... or buy@global.de'}
              value={email}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (val.startsWith('sup_')) setRole('SUPPLIER');
                if (val.startsWith('buy_')) setRole('BUYER');
              }}
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? { borderColor: themeAccent, boxShadow: `0 0 8px ${themeGlow}` } : {})
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Secret Access Password</label>
            <input 
              type="password" 
              required
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                ...(focusedField === 'password' ? { borderColor: themeAccent, boxShadow: `0 0 8px ${themeGlow}` } : {})
              }}
            />
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
            {isLoading ? 'EXECUTING VETTING RUN...' : 'Verify Credentials & Login'}
          </button>

          <button 
            type="button" 
            onClick={handleQuickFill} 
            disabled={isLoading}
            style={styles.demoFillBtn}
          >
            ⚡ Quick Seed Sandbox Parameters
          </button>
        </form>

        {onNavigateToOnboarding && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button 
              type="button" 
              onClick={onNavigateToOnboarding} 
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Need an account? <span style={{ color: themeAccent, textDecoration: 'underline' }}>Start Onboarding</span>
            </button>
          </div>
        )}
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
    padding: '24px 20px', 
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
  portalToggleContainer: { 
    display: 'flex', 
    gap: '6px', 
    padding: '4px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '10px', 
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0', 
    marginBottom: '20px' 
  },
  toggleBtn: { 
    flex: 1, 
    padding: '10px 4px', 
    border: '1px solid transparent', 
    background: 'none', 
    borderRadius: '8px', 
    fontSize: '11px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  },
  activeToggleBtn: { 
    backgroundColor: '#ffffff', 
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
  },
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
    lineHeight: '1.4'
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
    color: '#0284c7', 
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