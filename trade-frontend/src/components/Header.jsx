import React from 'react';

export default function Header({ user, onLogout, publicTab, setPublicTab }) {
  const isLoggedIn = !!user;
  const isSupplier = user?.role === 'SUPPLIER';
  
  // High-intensity vibrant accents matching the workspaces
  const themeColor = isLoggedIn ? (isSupplier ? '#fbbf24' : '#ec4899') : '#38bdf8';

  return (
    <header style={styles.headerContainer}>
      <div style={styles.brandGroup} onClick={() => !isLoggedIn && setPublicTab('home')}>
        <div style={{ ...styles.logoMark, background: themeColor, boxShadow: `0 0 12px ${themeColor}` }}>
          {isLoggedIn ? (isSupplier ? '🚢' : '🛒') : '✦'}
        </div>
        <div>
          <h1 style={styles.brandName}>AMAMA GLOBAL TRADE</h1>
          <span style={styles.networkStatus}>
            
            
          </span>
        </div>
      </div>

      {/* Navigation Layer */}
      <div style={styles.navMenu}>
        {!isLoggedIn ? (
          <>
            <button 
              onClick={() => setPublicTab('home')} 
              style={{...styles.navLink, color: publicTab === 'home' ? '#ffffff' : '#93c5fd'}}
            >
              Home 
            </button>
            <button 
              onClick={() => setPublicTab('register')} 
              style={{...styles.navLink, color: publicTab === 'register' ? '#ffffff' : '#93c5fd'}}
            >
              Apply / Register
            </button>
            <button 
              onClick={() => setPublicTab('login')} 
              style={{
                ...styles.loginActionBtn, 
                backgroundColor: publicTab === 'login' ? '#2563eb' : 'transparent',
                borderColor: publicTab === 'login' ? '#60a5fa' : '#3b82f6'
              }}
            >
              Sign In
            </button>
          </>
        ) : (
          /* Locked State Interface details (No extra navigation links displayed) */
          <div style={styles.roleContextBadge}>
            <span style={{ color: themeColor, marginRight: '8px', textShadow: `0 0 6px ${themeColor}` }}>●</span>
            <span style={styles.roleLabel}>
              {isSupplier ? 'SUPPLIER ENVIRONMENT' : 'BUYER PORTAL'}
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Profile Zone */}
      {isLoggedIn && (
        <div style={styles.userSection}>
          <div style={styles.userMeta}>
            <span style={styles.userName}>{user.companyName}</span>
            <span style={styles.userRoleText}>{user.email}</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}

const styles = {
  headerContainer: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 40px', 
    backgroundColor: 'rgba(30, 58, 138, 0.85)', // Saturated Royal Blue with glass backdrop
    backdropFilter: 'blur(16px)', 
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '2px solid #2563eb', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100, 
    boxSizing: 'border-box',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.3)'
  },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' },
  logoMark: { 
    width: '38px', 
    height: '38px', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#0f172a', // Saturated dark glyph contrast
    fontWeight: '900', 
    fontSize: '20px',
    transition: 'transform 0.2s'
  },
  brandName: { 
    margin: 0, 
    fontSize: '14px', 
    fontWeight: '900', 
    letterSpacing: '1.5px', 
    color: '#ffffff',
    textShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
  },
  networkStatus: { 
    fontSize: '11px', 
    color: '#93c5fd', 
    fontWeight: '800', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    marginTop: '2px' 
  },
  activeDot: { 
    width: '8px', 
    height: '8px', 
    borderRadius: '50%',
    boxShadow: '0 0 6px currentColor'
  },
  navMenu: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { 
    background: 'none', 
    border: 'none', 
    fontSize: '13px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    padding: '6px 12px', 
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  loginActionBtn: { 
    background: 'none', 
    border: '2px solid #3b82f6', 
    color: '#ffffff', 
    fontSize: '13px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    padding: '8px 20px', 
    borderRadius: '8px', 
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  roleContextBadge: { 
    backgroundColor: '#1e293b', 
    border: '2px solid #3b82f6', 
    borderRadius: '20px', 
    padding: '6px 18px', 
    display: 'flex', 
    alignItems: 'center', 
    fontSize: '11px', 
    fontWeight: '900', 
    letterSpacing: '0.75px',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
  },
  roleLabel: { color: '#ffffff' },
  userSection: { display: 'flex', alignItems: 'center', gap: '18px' },
  userMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  userName: { fontSize: '13px', fontWeight: '800', color: '#ffffff' },
  userRoleText: { fontSize: '11px', color: '#93c5fd', fontWeight: '700' },
  logoutBtn: { 
    backgroundColor: '#f43f5e', // Highly dynamic crimson-pink exit button
    border: 'none', 
    color: '#ffffff', 
    padding: '8px 16px', 
    borderRadius: '8px', 
    fontSize: '12px', 
    fontWeight: '800', 
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 10px rgba(244, 63, 94, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};