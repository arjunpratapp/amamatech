import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import OnboardingPortal from './components/OnboardingPortal'; 
import LandingPage from './components/LandingPage';
import SupplierWorkspace from './components/SupplierWorkspace';
import BuyerWorkspace from './components/BuyerWorkspace';
import MasterAdminWorkspace from './components/Admin/MasterAdminWorkspace';
import LiveMarketOverview from "./components/LiveMarketOverview";
// 🚢 Import the Logistics Portal Component
import LogisticsPortalDocumentGated from './components/Logistics/LogisticsPortal_DocumentGated';

export default function App() {
  const [user, setUser] = useState(null);
  const [publicTab, setPublicTab] = useState('home'); // 'home', 'register', 'login', 'market', 'admin', 'logistics'
  
  // Dynamic parameters passed into OnboardingPortal (e.g. { desk: 'buyer' } or { desk: 'supplier' })
  const [onboardingParams, setOnboardingParams] = useState(null);

  // Active HS Code for real-time market overview pages
  const [activeHsCode, setActiveHsCode] = useState('080510'); // Default: Fresh Orange

  // State to pass registered credentials from onboarding into Login component
  const [onboardedInfo, setOnboardedInfo] = useState({ email: '', role: 'SUPPLIER' });

  // Navigation handler originating from LandingPage, Header, or Market cards
  const handleLandingNavigation = (targetView, payload) => {
    if (targetView === 'onboarding' || targetView === 'register') {
      if (payload && payload.desk) {
        setOnboardingParams({ desk: payload.desk });
      } else {
        setOnboardingParams(null);
      }
      setPublicTab('register');
    } else if (targetView === 'login') {
      setPublicTab('login');
    } else if (targetView === 'home') {
      setPublicTab('home');
    } else if (targetView === 'admin') {
      setPublicTab('admin');
    } else if (targetView === 'logistics') {
      // Direct navigation to Logistics Tracking Portal
      setPublicTab('logistics');
    } else if (targetView === 'market') {
      if (payload && payload.hsCode) {
        setActiveHsCode(payload.hsCode);
      }
      setPublicTab('market');
    } else if (targetView === 'search') {
      console.log('Search query executed:', payload);
      if (payload?.hsCode) {
        setActiveHsCode(payload.hsCode);
        setPublicTab('market');
      } else {
        setPublicTab('register');
      }
    }
  };

  // Explicit login completion handler
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  // Called when onboarding completes -> Redirects to Login screen
  const handleOnboardingComplete = (credentials) => {
    if (credentials) {
      setOnboardedInfo({
        email: credentials.email || credentials.userId || '',
        role: credentials.role || 'SUPPLIER',
      });
    }
    setPublicTab('login');
  };

  const handleLogout = () => {
    setUser(null);
    setPublicTab('home'); 
    setOnboardedInfo({ email: '', role: 'SUPPLIER' });
    setOnboardingParams(null);
  };

  // Helper to render workspace cleanly based on normalized user role
  const renderUserWorkspace = () => {
    const userRole = (user?.role || '').toUpperCase();

    if (userRole === 'ADMIN' || userRole === 'MASTER_ADMIN') {
      return (
        <div style={styles.adminWrapper}>
          <MasterAdminWorkspace user={user} />
        </div>
      );
    }

    // 🚢 Role Check for Dedicated Logistics / Carrier User Account
    if (userRole === 'LOGISTICS' || userRole === 'CARRIER' || userRole === 'TRANSPORTER') {
      return (
        <div style={styles.logisticsWrapper}>
          <LogisticsPortalDocumentGated user={user} />
        </div>
      );
    }

    if (userRole === 'SUPPLIER' || userRole === 'SELLER') {
      return (
        <div style={styles.supplierWrapper}>
          <SupplierWorkspace user={user} />
          <div style={styles.authenticatedEngineTrack}>
            {/* Embedded logistics tracking widget inside Supplier workspace if needed */}
          </div>
        </div>
      );
    }

    // Default fallback to Buyer Workspace for 'BUYER' or unassigned roles
    return (
      <div style={styles.buyerWrapper}>
        <BuyerWorkspace user={user} />
        <div style={styles.authenticatedEngineTrack}>
          
        </div>
      </div>
    );
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
        {!user ? (
          <>
            {/* 1. PUBLIC LANDING PAGE */}
            {publicTab === 'home' && (
              <>
                <LandingPage onNavigate={handleLandingNavigation} />
                <div style={styles.publicSandboxContainer}>
                  
                </div>
              </>
            )}

            {/* 2. LIVE REAL-TIME MARKET OVERVIEW PAGE */}
            {publicTab === 'market' && (
              <div style={styles.marketPageContainer}>
                <LiveMarketOverview 
                  hsCode={activeHsCode} 
                  onNavigate={handleLandingNavigation} 
                />
              </div>
            )}
            
            {/* 3. ONBOARDING PORTAL */}
            {publicTab === 'register' && (
              <div style={styles.authCenteringContainer}>
                <OnboardingPortal 
                  initialParams={onboardingParams}
                  onComplete={handleOnboardingComplete} 
                />
              </div>
            )}
            
            {/* 4. LOGIN SCREEN */}
            {publicTab === 'login' && (
              <div style={styles.authCenteringContainer}>
                <Login 
                  initialEmail={onboardedInfo.email}
                  initialRole={onboardedInfo.role}
                  onLoginSuccess={handleAuthSuccess}
                  onNavigateToOnboarding={() => {
                    setOnboardingParams(null);
                    setPublicTab('register');
                  }}
                />
              </div>
            )}

            {/* 5. PUBLIC ADMIN DASHBOARD PREVIEW / SANDBOX VIEW */}
            {publicTab === 'admin' && (
              <div style={styles.adminWrapper}>
                <MasterAdminWorkspace />
              </div>
            )}

            {/* 🚢 6. PUBLIC LOGISTICS PORTAL SANDBOX / PREVIEW */}
            {publicTab === 'logistics' && (
              <div style={styles.logisticsWrapper}>
                <LogisticsPortalDocumentGated />
              </div>
            )}
          </>
        ) : (
          /* CASE B: USER IS LOGGED IN */
          renderUserWorkspace()
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#f8fafc'
  },
  marketPageContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingBottom: '60px'
  },
  publicSandboxContainer: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0 40px 60px',
    boxSizing: 'border-box'
  },
  authenticatedEngineTrack: {
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto',
    padding: '0 40px 40px',
    boxSizing: 'border-box'
  },
  adminWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f1f5f9',
    width: '100%',
    minHeight: 'calc(100vh - 80px)',
    overflow: 'hidden'
  },
  // 🚢 Added wrapper styling for Logistics Portal
  logisticsWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    borderTop: '2px solid #0f766e', 
    boxShadow: 'inset 0 4px 30px rgba(15, 118, 110, 0.05)'
  },
  supplierWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderTop: '2px solid #fbbf24', 
    boxShadow: 'inset 0 4px 30px rgba(251, 191, 36, 0.05)'
  },
  buyerWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderTop: '2px solid #ec4899', 
    boxShadow: 'inset 0 4px 30px rgba(236, 72, 153, 0.05)'
  }
};