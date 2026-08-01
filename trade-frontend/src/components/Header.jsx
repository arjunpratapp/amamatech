import React, { useState } from 'react';

export default function Header({ user, onLogout, publicTab, setPublicTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!user;
  const isSupplier = user?.role === 'SUPPLIER' || user?.role === 'SELLER';
  const isLogistics = user?.role === 'LOGISTICS' || user?.role === 'CARRIER' || user?.role === 'TRANSPORTER';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN';

  // Dynamic vibrant accents matching role workspaces
  const themeColor = isLoggedIn 
    ? (isAdmin ? '#60a5fa' : isLogistics ? '#10b981' : isSupplier ? '#fbbf24' : '#ec4899') 
    : '#38bdf8';

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
          padding: 16px 40px;
          background-color: rgba(30, 58, 138, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 2px solid #2563eb;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.3);
          width: 100%;
        }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Tablet Breakpoint (iPads & Small Laptops) */
        @media (max-width: 900px) {
          .header-container {
            padding: 14px 24px;
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
            gap: 10px;
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
          <div style={{ ...styles.logoMark, background: themeColor, boxShadow: `0 0 12px ${themeColor}` }}>
            {isLoggedIn ? (isAdmin ? '🛡️' : isLogistics ? '⚓' : isSupplier ? '📦' : '🛒') : '✦'}
          </div>
          <div>
            <h1 style={styles.brandName}>AMAMA GLOBAL TRADE</h1>
            <span style={styles.networkStatus}>
              {isAdmin 
                ? '🛡️ MASTER ADMIN CONSOLE' 
                : isLogistics 
                ? '⚓ LOGISTICS TRACKER ACTIVE' 
                : '● Operational Gateway'}
            </span>
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
                className="mobile-full-width"
                onClick={() => handleNavClick('home')} 
                style={{
                  ...styles.navLink, 
                  color: publicTab === 'home' ? '#ffffff' : '#93c5fd',
                  borderBottom: publicTab === 'home' ? '2px solid #38bdf8' : 'none'
                }}
              >
                Home
              </button>

              <button 
                className="mobile-full-width"
                onClick={() => handleNavClick('market')} 
                style={{
                  ...styles.navLink, 
                  color: publicTab === 'market' ? '#ffffff' : '#93c5fd',
                  borderBottom: publicTab === 'market' ? '2px solid #38bdf8' : 'none'
                }}
              >
                Market Overview
              </button>

              {/* 🚢 Logistics Public Preview Nav Link */}
              <button 
                className="mobile-full-width"
                onClick={() => handleNavClick('logistics')} 
                style={{
                  ...styles.navLink, 
                  color: publicTab === 'logistics' ? '#ffffff' : '#93c5fd',
                  borderBottom: publicTab === 'logistics' ? '2px solid #10b981' : 'none'
                }}
              >
                🚢 Logistics
              </button>

              <button 
                className="mobile-full-width"
                onClick={() => handleNavClick('register')} 
                style={{
                  ...styles.navLink, 
                  color: publicTab === 'register' ? '#ffffff' : '#93c5fd',
                  borderBottom: publicTab === 'register' ? '2px solid #38bdf8' : 'none'
                }}
              >
                Apply / Register
              </button>

              {/* Public ERP Admin Portal Toggle / Preview Link */}
              <button 
                className="mobile-full-width"
                onClick={() => handleNavClick('admin')} 
                style={{
                  ...styles.navLink, 
                  color: publicTab === 'admin' ? '#ffffff' : '#93c5fd',
                  borderBottom: publicTab === 'admin' ? '2px solid #60a5fa' : 'none'
                }}
              >
                ERP Admin
              </button>

              <button 
                className="mobile-full-width"
                onClick={() => handleNavClick('login')} 
                style={{
                  ...styles.loginActionBtn, 
                  background: publicTab === 'login' ? '#0284c7' : '#0369a1'
                }}
              >
                Sign In
              </button>
            </>
          ) : (
            <div className="user-section-mobile" style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name || user.email || 'Admin Controller'}</span>
                <span style={{ ...styles.userBadge, borderColor: themeColor, color: themeColor }}>
                  {user.role || 'ADMIN'}
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
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f172a',
    fontWeight: '900',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
  },
  brandName: {
    color: '#ffffff',
    fontSize: '1.05rem',
    fontWeight: '900',
    letterSpacing: '0.04em',
    margin: 0,
    lineHeight: 1.2,
  },
  networkStatus: {
    color: '#34d399',
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  navLink: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loginActionBtn: {
    color: '#ffffff',
    border: '1px solid #38bdf8',
    padding: '8px 18px',
    borderRadius: '8px',
    fontWeight: '800',
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
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '800',
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
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};