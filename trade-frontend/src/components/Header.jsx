import React, { useState } from 'react';

export default function Header({ user, onLogout, publicTab, setPublicTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!user;
  const isSupplier = user?.role === 'SUPPLIER' || user?.role === 'SELLER';
  const isLogistics = user?.role === 'LOGISTICS' || user?.role === 'CARRIER' || user?.role === 'TRANSPORTER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN';

  // Tasteful dynamic accents matching roles
  const roleColor = isLoggedIn 
    ? (isAdmin ? '#60a5fa' : isLogistics ? '#34d399' : isSupplier ? '#eab308' : '#f472b6') 
    : '#eab308';

  const handleNavClick = (tab) => {
    if (setPublicTab) setPublicTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Dynamic Responsive Stylesheet Injection */}
      <style>{`
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 36px;
          /* Sophisticated Deep Slate-Navy Background */
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(234, 179, 8, 0.25);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          width: 100%;
        }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          color: #fef08a;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Subtle Champagne Gold Accent */
        .gold-brand-text {
          color: #fef08a;
          letter-spacing: 0.05em;
        }

        .nav-button-item {
          background: none;
          border: none;
          padding: 8px 14px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .nav-button-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Tablet Breakpoint (iPads & Small Laptops) */
        @media (max-width: 900px) {
          .header-container {
            padding: 12px 20px;
          }
        }

        /* Mobile Breakpoint (Smartphones & Portrait Tabs) */
        @media (max-width: 680px) {
          .header-container {
            padding: 12px 16px;
            flex-wrap: wrap;
          }

          .hamburger-btn {
            display: block;
          }

          .nav-menu {
            display: ${mobileMenuOpen ? 'flex' : 'none'};
            flex-direction: column;
            width: 100%;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            align-items: stretch;
            gap: 8px;
          }

          .mobile-full-width {
            width: 100%;
            text-align: center;
          }

          .user-section-mobile {
            width: 100%;
            justify-content: space-between;
            margin-top: 8px;
          }
        }
      `}</style>

      <header className="header-container">
        {/* Brand Group */}
        <div 
          style={styles.brandGroup} 
          onClick={() => {
            if (!isLoggedIn && setPublicTab) handleNavClick('home');
          }}
        >
          {/* Subtle Amma Gold Icon Badge */}
          <div style={styles.logoMark}>
            {isLoggedIn ? (isAdmin ? '🛡️' : isLogistics ? '⚓' : isSupplier ? '📦' : '🛒') : '✦'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="gold-brand-text" style={styles.brandName}>
              AMAMA TECHNOLOGIES
            </h1>
            
          </div>
        </div>

        {/* Hamburger Toggle Button for Mobile Screens */}
        <button 
          className="hamburger-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation & Action Layer */}
        <div className="nav-menu">
          {!isLoggedIn ? (
            <>
              <button 
                className="nav-button-item mobile-full-width"
                onClick={() => handleNavClick('home')} 
                style={{
                  color: publicTab === 'home' ? '#fef08a' : '#cbd5e1',
                  borderBottom: publicTab === 'home' ? '2px solid #eab308' : '2px solid transparent'
                }}
              >
                Home
              </button>

              <button 
                className="nav-button-item mobile-full-width"
                onClick={() => handleNavClick('market')} 
                style={{
                  color: publicTab === 'market' ? '#fef08a' : '#cbd5e1',
                  borderBottom: publicTab === 'market' ? '2px solid #eab308' : '2px solid transparent'
                }}
              >
                Market Overview
              </button>

              <button 
                className="nav-button-item mobile-full-width"
                onClick={() => handleNavClick('logistics')} 
                style={{
                  color: publicTab === 'logistics' ? '#fef08a' : '#cbd5e1',
                  borderBottom: publicTab === 'logistics' ? '2px solid #34d399' : '2px solid transparent'
                }}
              >
                🚢 Logistics
              </button>

              <button 
                className="nav-button-item mobile-full-width"
                onClick={() => handleNavClick('register')} 
                style={{
                  color: publicTab === 'register' ? '#fef08a' : '#cbd5e1',
                  borderBottom: publicTab === 'register' ? '2px solid #eab308' : '2px solid transparent'
                }}
              >
                Apply / Register
              </button>

              <button 
                className="nav-button-item mobile-full-width"
                onClick={() => handleNavClick('admin')} 
                style={{
                  color: publicTab === 'admin' ? '#fef08a' : '#cbd5e1',
                  borderBottom: publicTab === 'admin' ? '2px solid #60a5fa' : '2px solid transparent'
                }}
              >
                ERP Admin
              </button>

              <button 
                className="mobile-full-width"
                onClick={() => handleNavClick('login')} 
                style={styles.loginActionBtn}
              >
                Sign In
              </button>
            </>
          ) : (
            <div className="user-section-mobile" style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name || user.email || 'Admin Controller'}</span>
                <span style={{ ...styles.userBadge, borderColor: roleColor, color: roleColor }}>
                  {user.role || 'SUPPLIER'}
                </span>
              </div>
              <button 
                className="mobile-full-width"
                onClick={onLogout} 
                style={styles.logoutBtn}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

const styles = {
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoMark: {
    width: '34px',
    height: '34px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(234, 179, 8, 0.15)',
    border: '1px solid rgba(234, 179, 8, 0.4)',
    color: '#fef08a',
    fontWeight: '800',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: '800',
    margin: 0,
    lineHeight: 1.1,
  },
  subtext: {
    color: '#94a3b8',
    fontSize: '0.62rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    marginTop: '2px',
  },
  loginActionBtn: {
    color: '#fef08a',
    background: 'rgba(234, 179, 8, 0.12)',
    border: '1px solid rgba(234, 179, 8, 0.4)',
    padding: '7px 16px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  userBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    border: '1px solid',
    padding: '1px 6px',
    borderRadius: '4px',
    marginTop: '2px',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};