import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register'; 
import AboutCompanyNode from './components/AboutCompanyNode'; 
import SupplierWorkspace from './components/SupplierWorkspace';
import BuyerWorkspace from './components/BuyerWorkspace';
// 1. IMPORT THE LIVE TELEMETRY FX CLEARING ENGINE Component
import TradeClearingEngine from './components/TradeClearingEngine'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [publicTab, setPublicTab] = useState('home'); // Set 'home' as initial state to avoid blank screens

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setPublicTab('home'); 
  };

  return (
    <div style={styles.appContainer}>
      
      <Header 
        user={user} 
        onLogout={handleLogout} 
        publicTab={publicTab} 
        setPublicTab={setPublicTab} 
      />

      <main style={styles.mainContent}>
        {/* CASE A: USER IS NOT LOGGED IN */}
        {!user && (
          <>
            {publicTab === 'home' && (
              <>
                {/* Landing Core Content Node */}
                <AboutCompanyNode onNavigateToRegister={() => setPublicTab('register')} />
                
                {/* 2. OPTIONAL public sandbox layout preview */}
                <div style={styles.publicSandboxContainer}>
                  <TradeClearingEngine />
                </div>
              </>
            )}
            
            {publicTab === 'register' && (
              <div style={styles.authCenteringContainer}>
                <Register onRegisterSuccess={() => setPublicTab('login')} />
              </div>
            )}
            
            {publicTab === 'login' && (
              <div style={styles.authCenteringContainer}>
                <Login onLoginSuccess={handleLoginSuccess} />
              </div>
            )}
          </>
        )}

        {/* CASE B: USER IS LOGGED IN (High Contrast Unique Color Themes) */}
        {user && (
          user.role === 'SUPPLIER' ? (
            <div style={styles.supplierWrapper}>
              {/* Pass engine inside workspace layout, or nest it straight inside your Supplier workspace container */}
              <SupplierWorkspace user={user} />
              <div style={styles.authenticatedEngineTrack}>
                <TradeClearingEngine />
              </div>
            </div>
          ) : (
            <div style={styles.buyerWrapper}>
              <BuyerWorkspace user={user} />
              <div style={styles.authenticatedEngineTrack}>
                <TradeClearingEngine />
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#090d16', 
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    width: '100%',
    maxWidth: 'none',
    boxSizing: 'border-box'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  authCenteringContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#090d16'
  },
  
  /* Public Interface Preview Lane Wrapper */
  publicSandboxContainer: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 40px 60px',
    boxSizing: 'border-box'
  },

  /* Authenticated Node Tracks Padding Adjustments */
  authenticatedEngineTrack: {
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto',
    padding: '0 40px 40px',
    boxSizing: 'border-box'
  },
  
  /* Vibrant Supplier Identity Breakout: Amber Glow */
  supplierWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0b0f17',
    borderTop: '2px solid #fbbf24', 
    boxShadow: 'inset 0 4px 30px rgba(251, 191, 36, 0.05)'
  },

  /* Vibrant Buyer Identity Breakout: Magenta Glow */
  buyerWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0d0b14',
    borderTop: '2px solid #ec4899', 
    boxShadow: 'inset 0 4px 30px rgba(236, 72, 153, 0.05)'
  }
};