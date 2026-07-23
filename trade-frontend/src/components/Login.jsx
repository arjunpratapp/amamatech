import React, { useState } from 'react';

// Isolated Authentication Pipeline (Ready for API substitution later)
const mockApiAuthentication = async (email, password, role) => {
  // Simulate network flight time latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // CURRENT TESTING LAYER: Validates against dummy test seeds
  if (role === 'SUPPLIER' && email === 'ops@amamaexporters.com' && password === 'supplier123') {
    return {
      success: true,
      user: {
        email,
        role,
        companyId: 'AMAMA_EXP_991',
        companyName: 'Amama Exporters Pvt Ltd'
      }
    };
  } else if (role === 'BUYER' && email === 'procurement@globalbuy.de' && password === 'buyer123') {
    return {
      success: true,
      user: {
        email,
        role,
        companyId: 'GLOBAL_BUY_007',
        companyName: 'Global Buy Logistics'
      }
    };
  }

  // Fallback production error structure
  return {
    success: false,
    message: 'Invalid redentials. Gateway handshake refused.'
  };
};

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState('SUPPLIER'); // 'SUPPLIER' or 'BUYER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Dynamic Neon Signature tokens mapping down from the parent shell rules
  const themeAccent = role === 'SUPPLIER' ? '#fbbf24' : '#ec4899';
  const themeGlow = role === 'SUPPLIER' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(236, 72, 153, 0.15)';

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

    if (!email || !password) {
      setError('Please fill in all secure authentication fields.');
      setIsLoading(false);
      return;
    }

    try {
      // Direct hook call out into the processing pipeline
      const result = await mockApiAuthentication(email, password, role);

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Internal clearing node error encountered during validation pass.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.loginWrapper}>
      {/* Morphing ambient workspace background blurs */}
      <div style={{ ...styles.ambientGlowTop, background: `radial-gradient(circle, ${themeGlow} 0%, rgba(9, 13, 22, 0) 70%)` }}></div>

      <div style={{ ...styles.loginCard, border: `2px solid ${themeAccent}`, boxShadow: `0 15px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${themeGlow}` }}>
        {/* Brand Identity */}
        <div style={styles.brandHeader}>
          <div style={{ ...styles.logoBadge, backgroundColor: themeAccent, boxShadow: `0 4px 14px ${themeGlow}` }}>
            {role === 'SUPPLIER' ? '🚢' : '🛒'}
          </div>
          <h2 style={styles.title}>Secure Trade Portal</h2>
          <p style={styles.subtitle}>Unified Clearing &amp; Regulatory Escrow Environment</p>
        </div>

        {/* Segmented Controller (Tabs) */}
        <div style={styles.portalToggleContainer}>
          <button 
            type="button" 
            onClick={() => { setRole('SUPPLIER'); setEmail(''); setPassword(''); setError(''); }} 
            style={{
              ...styles.toggleBtn, 
              ...(role === 'SUPPLIER' ? styles.activeToggleBtn : {}),
              color: role === 'SUPPLIER' ? '#ffffff' : '#93c5fd',
              borderColor: role === 'SUPPLIER' ? '#fbbf24' : 'transparent'
            }}
          >
            Supplier Desk
          </button>
          <button 
            type="button" 
            onClick={() => { setRole('BUYER'); setEmail(''); setPassword(''); setError(''); }} 
            style={{
              ...styles.toggleBtn, 
              ...(role === 'BUYER' ? styles.activeToggleBtn : {}),
              color: role === 'BUYER' ? '#ffffff' : '#93c5fd',
              borderColor: role === 'BUYER' ? '#ec4899' : 'transparent'
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

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Corporate Email Address</label>
            <input 
              type="email" 
              required
              disabled={isLoading}
              placeholder={role === 'SUPPLIER' ? 'ops@amamaexporters.com' : 'procurement@globalbuy.de'}
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
    padding: '40px 24px', 
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#090d16', // Grounded shell tone
    width: '100%',
    boxSizing: 'border-box'
  },
  ambientGlowTop: {
    position: 'absolute',
    top: '-10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '500px',
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
    backgroundColor: '#1e293b', 
    borderRadius: '16px', 
    padding: '40px', 
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },
  brandHeader: { textAlign: 'center', marginBottom: '32px' },
  logoBadge: { 
    height: '48px', 
    width: '48px', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '22px', 
    margin: '0 auto 16px',
    transition: 'all 0.3s ease'
  },
  title: { fontSize: '24px', fontWeight: '900', margin: '0 0 8px', color: '#ffffff', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '13px', color: '#93c5fd', margin: 0, lineHeight: '1.5', fontWeight: '500' },
  portalToggleContainer: { 
    display: 'flex', 
    gap: '6px', 
    padding: '4px', 
    backgroundColor: '#0f172a', 
    borderRadius: '10px', 
    border: '2px solid #3b82f6', 
    marginBottom: '28px' 
  },
  toggleBtn: { 
    flex: 1, 
    padding: '12px 0', 
    border: '1px solid transparent', 
    background: 'none', 
    borderRadius: '8px', 
    fontSize: '13px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  activeToggleBtn: { 
    backgroundColor: '#1e293b', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.75px' },
  input: { 
    padding: '14px 16px', 
    borderRadius: '8px', 
    border: '2px solid #3b82f6', 
    backgroundColor: '#0f172a', 
    color: '#ffffff', 
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
    backgroundColor: 'rgba(244, 63, 94, 0.1)', 
    border: '1px solid #f43f5e', 
    color: '#f43f5e', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    fontSize: '13px',
    fontWeight: '700',
    lineHeight: '1.4'
  },
  submitBtn: { 
    color: '#ffffff', 
    border: 'none', 
    padding: '14px', 
    borderRadius: '8px', 
    fontSize: '13px', 
    fontWeight: '800', 
    marginTop: '8px',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  demoFillBtn: { 
    background: 'none', 
    border: '2px dashed #3b82f6', 
    color: '#93c5fd', 
    padding: '12px', 
    borderRadius: '8px', 
    fontSize: '12px', 
    fontWeight: '800',
    cursor: 'pointer', 
    transition: 'all 0.2s ease',
    marginTop: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};