import React, { useState, useEffect } from 'react';
import liveRateService from '../utils/liveRateService';
import LiveRateTicker from './LiveRateTicker';

export default function BuyerWorkspace({ user }) {
  const [currentSpotRate, setCurrentSpotRate] = useState(liveRateService.getCurrentRate());
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    return liveRateService.subscribe((rate) => setCurrentSpotRate(rate));
  }, []);

  const [escrowFunds, setEscrowFunds] = useState(185000);
  const [bidsCount, setBidsCount] = useState(4);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fallback signature if user bypassed or refreshed registration
  const finalSignature = user?.authoritySignature || "SIG-DGFT-A91K72L-2026";

  const handleFundDeployment = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setEscrowFunds(prev => prev + 50000);
      setBidsCount(prev => prev + 1);
      setIsDeploying(false);
    }, 1000);
  };

  const getCardStyle = (id, baseBg, baseBorder) => ({
    ...styles.metricCard,
    backgroundColor: baseBg,
    border: baseBorder,
    transform: hoveredCard === id ? 'translateY(-6px)' : 'translateY(0)',
    boxShadow: hoveredCard === id 
      ? '0 16px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(96, 165, 250, 0.2)' 
      : '0 10px 25px rgba(0, 0, 0, 0.2)'
  });

  return (
    <div style={styles.fullPageDashboard}>
      <LiveRateTicker />

      {/* Header featuring the Authority Validation Badge */}
      <div style={styles.dashboardHeader}>
        <div>
          <span style={styles.badgeBuyer}>🌎 GLOBAL PROCUREMENT EXECUTIVE GATEWAY</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
            <h2 style={styles.viewTitle}>{user?.companyName || 'Global Buy Logistics GmbH'}</h2>
            
            {/* HIGH-VISIBILITY AUTHORITY VERIFICATION SEAL */}
            <div style={styles.miniAuthorityBadge}>
              <span style={styles.badgeIcon}>🛡️</span>
              <div>
                <div style={styles.badgeLabelText}>DGFT &amp; GSTIN VERIFIED</div>
                <div style={styles.badgeHash}>{finalSignature}</div>
              </div>
            </div>
          </div>
          <p style={styles.viewSubtitle}>
            Centralized Escrow Clearing Node Architecture • Sovereign Settlement Pipeline Active
          </p>
        </div>
        <div style={styles.livePulseContainer}>
          <div style={{...styles.pulseDot, backgroundColor: '#4ade80'}}></div>
          <span style={styles.pulseText}>Sovereign Escrow Node Operational</span>
        </div>
      </div>

      <div style={styles.capitalActionWidget}>
        <div style={{ flex: 1, marginRight: '24px' }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '15px', fontWeight: '800' }}>Liquidity &amp; Smart Escrow Deployment Hub</h4>
          <p style={{ margin: '0 0 12px 0', color: '#93c5fd', fontSize: '13px' }}>Instantly lock trade collateral reserves assigned toward South-Asian manufacturing channels.</p>
          
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressBar, width: `${Math.min((escrowFunds / 400000) * 100, 100)}%` }}></div>
          </div>
        </div>
        <button onClick={handleFundDeployment} disabled={isDeploying} style={styles.buyerActionBtn}>
          {isDeploying ? 'Routing Capital Via API...' : '➕ Allocate $50,000 USD Escrow Reserve'}
        </button>
      </div>

      <div style={styles.wideMetricsGrid}>
        <div 
          style={getCardStyle('bids', '#4f46e5', '1px solid #818cf8')}
          onMouseEnter={() => setHoveredCard('bids')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={styles.cardIcon}>🛒</span>
          <div style={{ ...styles.cardHeader, color: '#e0e7ff' }}>Sourcing Orders</div>
          <div style={styles.stat}>{bidsCount} Active Bids</div>
          <p style={{ ...styles.cardBody, color: '#e0e7ff' }}>Bulk agricultural, metallurgical, and engineering commodity streams broadcasting continuously.</p>
        </div>
        
        <div 
          style={getCardStyle('escrow', '#0d9488', '1px solid #2dd4bf')}
          onMouseEnter={() => setHoveredCard('escrow')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={styles.cardIcon}>🛡️</span>
          <div style={{ ...styles.cardHeader, color: '#ccfbf1' }}>Multi-Sig Capital Liquidity</div>
          <div style={{ ...styles.stat, marginBottom: '2px' }}>${escrowFunds.toLocaleString('en-US')}.00 USD</div>
          <div style={styles.inrConversionText}>
            ≈ ₹{(escrowFunds * currentSpotRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })} INR
          </div>
          <p style={{ ...styles.cardBody, color: '#ccfbf1' }}>Funds securely bound within localized RBI &amp; cryptographic protocols mapped to transport nodes.</p>
        </div>

        <div 
          style={getCardStyle('mills', '#0284c7', '1px solid #38bdf8')}
          onMouseEnter={() => setHoveredCard('mills')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={styles.cardIcon}>🏢</span>
          <div style={{ ...styles.cardHeader, color: '#bae6fd' }}>Verified Production Facilities</div>
          <div style={styles.stat}>28 Indian Mills</div>
          <p style={{ ...styles.cardBody, color: '#e0f2fe' }}>Direct, intermediary-free connection pathways with certified industrial manufacturing plants.</p>
        </div>

        <div 
          style={getCardStyle('latency', '#b45309', '1px solid #fbbf24')}
          onMouseEnter={() => setHoveredCard('latency')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={styles.cardIcon}>⚡</span>
          <div style={{ ...styles.cardHeader, color: '#fef08a' }}>Execution Latency Index</div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', zIndex: 2 }}>
            <div style={styles.stat}>0.42s</div>
            <svg width="65" height="22" style={{ opacity: 0.85 }}>
              <polyline fill="none" stroke="#fef08a" strokeWidth="2.5" points="0,18 12,20 25,6 38,14 50,4 65,11" />
            </svg>
          </div>
          <p style={{ ...styles.cardBody, color: '#fef3c7' }}>Real-time programmatic automated checks tracking global matching frameworks.</p>
        </div>
      </div>

      <div style={styles.splitContentTableSection}>
        <div style={styles.tablePanelLarge}>
          <h3 style={styles.panelTitle}>Verified Network Origin Nodes</h3>
          <div style={styles.pseudoTableContainer}>
            <div style={styles.tableHeaderRow}>
              <div style={{flex: 3}}>Manufacturer Node Identity</div>
              <div style={{flex: 2}}>Industrial Cluster</div>
              <div style={{flex: 2}}>Integrity Score</div>
              <div style={{flex: 2}}>Verification Network</div>
            </div>
            <div style={styles.tableDataRow}>
              <div style={{flex: 3, fontWeight: '800', color: '#fff'}}>Amama Exporters Pvt Ltd</div>
              <div style={{flex: 2, color: '#e2e8f0'}}>JNPT Logistics Hub, MH</div>
              <div style={{flex: 2, color: '#4ade80', fontWeight: '800'}}>99.8% Perfect</div>
              <div style={{flex: 2, display: 'flex', gap: '6px'}}>
                <span style={styles.tableBadgeBlue}>DGFT</span>
                <span style={styles.tableBadgeGreen}>GSTIN ACTIVE</span>
              </div>
            </div>
            <div style={styles.tableDataRow}>
              <div style={{flex: 3, fontWeight: '800', color: '#fff'}}>Gujarat Agro-Processing Corp</div>
              <div style={{flex: 2, color: '#e2e8f0'}}>Kandla Port Terminal, GJ</div>
              <div style={{flex: 2, color: '#4ade80', fontWeight: '800'}}>98.4% Clear</div>
              <div style={{flex: 2, display: 'flex', gap: '6px'}}>
                <span style={styles.tableBadgeBlue}>DGFT</span>
                <span style={styles.tableBadgeGreen}>GSTIN ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sharedStyles = {
  fullPageDashboard: { 
    flex: 1, width: '100%', padding: '40px', boxSizing: 'border-box', 
    display: 'flex', flexDirection: 'column', gap: '32px', 
    background: 'linear-gradient(135deg, #101c3a 0%, #070a13 100%)' 
  },
  dashboardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '24px' },
  viewTitle: { fontSize: '26px', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(37, 99, 235, 0.5)', letterSpacing: '-0.5px', margin: 0 },
  viewSubtitle: { fontSize: '13px', color: '#64748b', marginTop: '12px', marginBottom: 0, lineHeight: '1.5' },
  livePulseContainer: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e3a8a', border: '1px solid #3b82f6', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)' },
  pulseDot: { height: '10px', width: '10px', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' },
  pulseText: { fontSize: '12px', fontWeight: '800', color: '#ffffff' },
  wideMetricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', width: '100%' },
  metricCard: { borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease' },
  cardIcon: { fontSize: '28px', marginBottom: '12px', zIndex: 2 },
  cardHeader: { fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', zIndex: 2 },
  stat: { fontSize: '26px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', zIndex: 2 },
  cardBody: { fontSize: '13px', lineHeight: '1.6', margin: 'auto 0 0 0', paddingTop: '16px', zIndex: 2 },
  splitContentTableSection: { width: '100%', display: 'flex', flexDirection: 'column' },
  tablePanelLarge: { backgroundColor: '#0b1120', border: '2px solid #1e293b', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' },
  panelTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '900', color: '#ffffff' },
  pseudoTableContainer: { display: 'flex', flexDirection: 'column' },
  tableHeaderRow: { display: 'flex', padding: '14px 20px', backgroundColor: '#070a13', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.5px', border: '1px solid #1e293b' },
  tableDataRow: { display: 'flex', padding: '18px 20px', borderBottom: '1px solid #1e293b', fontSize: '14px', alignItems: 'center' }
};

const styles = {
  ...sharedStyles,
  badgeBuyer: { display: 'inline-block', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '10px', fontWeight: '800', letterSpacing: '0.75px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)' },
  capitalActionWidget: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 58, 138, 0.3)', border: '1px solid #1e3a8a', borderRadius: '16px', padding: '20px 24px', width: '100%', boxSizing: 'border-box', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' },
  buyerActionBtn: { backgroundColor: '#ec4899', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' },
  inrConversionText: { fontSize: '13px', color: '#fef08a', fontWeight: '800', marginBottom: '12px', zIndex: 2, fontFamily: 'ui-monospace, monospace' },
  progressTrack: { width: '100%', height: '6px', backgroundColor: '#070a13', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' },
  progressBar: { height: '100%', backgroundColor: '#ec4899', transition: 'width 0.4s ease-in-out' },
  tableBadgeBlue: { backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
  tableBadgeGreen: { backgroundColor: 'rgba(74, 222, 128, 0.15)', border: '1px solid #4ade80', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
  
  /* Added Header Verification Badge */
  miniAuthorityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid #10b981',
    borderRadius: '6px',
    padding: '6px 12px',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)'
  },
  badgeIcon: { fontSize: '16px' },
  badgeLabelText: { fontSize: '9px', fontWeight: '900', color: '#10b981', letterSpacing: '0.5px' },
  badgeHash: { fontSize: '9px', color: '#ffffff', opacity: 0.8, fontFamily: 'ui-monospace, monospace', marginTop: '1px' }
};