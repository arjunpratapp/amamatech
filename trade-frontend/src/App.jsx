import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import LogisticsLogin from './components/Logistics/LogisticsLogin'; // 👈 Logistics Login Page
import OnboardingPortal from './components/OnboardingPortal';
import LandingPage from './components/LandingPage';
import BuyerWorkspace from './components/BuyerWorkspace';
import MasterAdminWorkspace from './components/Admin/MasterAdminWorkspace';
import AdminLogin from './components/Admin/AdminLogin';
import LiveMarketOverview from './components/LiveMarketOverview';
import LogisticsPortalDocumentGated from './components/Logistics/LogisticsPortal_DocumentGated';

// 🚢 Import Supplier Workspace Component
import SupplierWorkspaceReplicated from './components/SupplierWorkspace';

// ==========================================
// Main Application Component
// ==========================================
export default function App() {
  // User auth state
  const [user, setUser] = useState(null);
  
  // Active navigation tab for public views
  const [publicTab, setPublicTab] = useState('home');

  // Dynamic parameters passed into OnboardingPortal
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
      setPublicTab('logistics');
    } else if (targetView === 'market') {
      if (payload && payload.hsCode) {
        setActiveHsCode(payload.hsCode);
      }
      setPublicTab('market');
    } else if (targetView === 'search') {
      if (payload?.hsCode) {
        setActiveHsCode(payload.hsCode);
        setPublicTab('market');
      } else {
        setPublicTab('register');
      }
    }
  };

  // Explicit login completion handler (with role normalization & fallback protection)
  const handleAuthSuccess = (authenticatedUser) => {
    if (!authenticatedUser) return;

    // Normalize incoming role field names (role, userType, accountType)
    const rawRole = authenticatedUser.role || authenticatedUser.userType || authenticatedUser.accountType || 'BUYER';
    
    setUser({
      ...authenticatedUser,
      role: rawRole.trim().toUpperCase()
    });
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
    localStorage.removeItem('adminToken');
  };

  // Helper to render workspace cleanly based on normalized user role
  const renderUserWorkspace = () => {
    // Trim and upper-case role to guard against string mismatch bugs
    const userRole = (user?.role || '').trim().toUpperCase();

    // 1. Admin Workspace Check
    if (userRole === 'ADMIN' || userRole === 'MASTER_ADMIN') {
      return (
        <div style={styles.adminWrapper}>
          <MasterAdminWorkspace user={user} onLogout={handleLogout} onNavigate={handleLandingNavigation} />
        </div>
      );
    }

    // 2. Logistics Workspace Check
    if (userRole === 'LOGISTICS' || userRole === 'CARRIER' || userRole === 'TRANSPORTER' || userRole === 'DRIVER' || userRole === 'DISPATCHER' || userRole === 'FLEET MANAGER') {
      return (
        <div style={styles.logisticsWrapper}>
          <LogisticsPortalDocumentGated user={user} onLogout={handleLogout} onNavigate={handleLandingNavigation} />
        </div>
      );
    }

    // 3. 🚢 Supplier / Exporter Workspace
    if (userRole === 'SUPPLIER' || userRole === 'SELLER' || userRole === 'EXPORTER') {
      return (
        <div style={styles.supplierWrapper}>
          <SupplierWorkspaceReplicated 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={handleLandingNavigation} 
          />
        </div>
      );
    }

    // 4. Buyer Workspace (Default fallback)
    return (
      <div style={styles.buyerWrapper}>
        <BuyerWorkspace user={user} onLogout={handleLogout} onNavigate={handleLandingNavigation} />
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
        {!user ? (
          <>
            {publicTab === 'home' && (
              <LandingPage onNavigate={handleLandingNavigation} />
            )}

            {publicTab === 'market' && (
              <div style={styles.marketPageContainer}>
                <LiveMarketOverview 
                  hsCode={activeHsCode} 
                  onNavigate={handleLandingNavigation} 
                />
              </div>
            )}
            
            {publicTab === 'register' && (
              <div style={styles.authCenteringContainer}>
                <OnboardingPortal 
                  initialParams={onboardingParams}
                  onComplete={handleOnboardingComplete} 
                />
              </div>
            )}
            
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

            {/* SECURED ADMIN LOGIN SCREEN */}
            {publicTab === 'admin' && (
              <div style={styles.authCenteringContainer}>
                <AdminLogin onLoginSuccess={handleAuthSuccess} />
              </div>
            )}

            {/* LOGISTICS LOGIN PORTAL */}
            {publicTab === 'logistics' && (
              <div style={styles.logisticsLoginWrapper}>
                <LogisticsLogin onLoginSuccess={handleAuthSuccess} />
              </div>
            )}
          </>
        ) : (
          renderUserWorkspace()
        )}
      </main>

      <Footer />
    </div>
  );
}

// ==========================================
// Workspace Wrapper Styles
// ==========================================
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
  adminWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f1f5f9',
    width: '100%',
    minHeight: 'calc(100vh - 80px)',
    overflow: 'hidden'
  },
  logisticsLoginWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0f172a',
    width: '100%'
  },
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
    backgroundColor: '#f8fafc',
    borderTop: '2px solid #059669', 
    boxShadow: 'inset 0 4px 30px rgba(5, 150, 105, 0.05)'
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