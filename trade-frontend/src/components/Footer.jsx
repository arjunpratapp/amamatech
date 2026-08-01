import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={styles.footerContainer}>
      {/* Upper Layer: Corporate Hub & Quick Actions */}
      <div style={styles.upperMatrix}>
        <div style={styles.brandBlock}>
          <div style={styles.brandTitle}>AMAMA EXPORTERS</div>
          <p style={styles.brandDesc}>
            AI-powered global trade intelligence platform connecting verified agricultural producers with international buyers across 200+ active markets.
          </p>
        </div>
        
        <div style={styles.linksGrid}>
          {/* Column 1: Commodity Markets */}
          <div style={styles.linkColumn}>
            <span style={styles.columnHeader}>Commodity Markets</span>
            <a href="#products" style={styles.footerLink}>Grains & Cereals</a>
            <a href="#products" style={styles.footerLink}>Spices & Herbs</a>
            <a href="#products" style={styles.footerLink}>Oilseeds & Pulses</a>
            <a href="#products" style={styles.footerLink}>Fresh Produce</a>
          </div>

          {/* Column 2: Trade Intelligence */}
          <div style={styles.linkColumn}>
            <span style={styles.columnHeader}>Trade Intelligence</span>
            <a href="#search" style={styles.footerLink}>HS Code Directory</a>
            <a href="#ticker" style={styles.footerLink}>Live Market Benchmarks</a>
            <a href="#analytics" style={styles.footerLink}>Harvest & Price Analytics</a>
            <a href="#rfq" style={styles.footerLink}>Request for Quote (RFQ)</a>
          </div>

          {/* Column 3: Compliance & Legal */}
          <div style={styles.linkColumn}>
            <span style={styles.columnHeader}>Compliance & Verification</span>
            <a href="#apeda" style={styles.footerLink}>APEDA & FSSAI Standards</a>
            <a href="#phytosanitary" style={styles.footerLink}>Phytosanitary Certification</a>
            <a href="#incoterms" style={styles.footerLink}>Incoterms 2020 Guide</a>
            <a href="#terms" style={styles.footerLink}>Terms of Trade</a>
          </div>
        </div>
      </div>

      <div style={styles.divider}></div>

      {/* Lower Layer: Quality Badges, Copyright, & Operational Telemetry */}
      <div style={styles.footerRow}>
        {/* Left: Trade & Compliance Badges */}
        <div style={styles.specsGroup}>
          <div style={styles.securityTag}>
            <span style={styles.tagIcon}>🌿</span> APEDA Registered
          </div>
          <div style={styles.securityTag}>
            <span style={styles.tagIcon}>🔬</span> FSSAI / ISO 22000
          </div>
          <div style={styles.securityTag}>
            <span style={styles.tagIcon}>📜</span> DGFT Authorized
          </div>
        </div>

        {/* Center: Legal Attributions */}
        <div style={styles.copyText}>
          © 2026 Amama Exporters Inc. Global Agricultural Intelligence Interface. All rights reserved.
        </div>

        {/* Right: Live Data Feed Latency */}
        <div style={styles.latencyIndicator}>
          <div style={styles.pulseContainer}>
            <div style={styles.pulseCore}></div>
            <div style={styles.pulseWave}></div>
          </div>
          <span style={styles.latencyText}>
            Trade Engine Ping: <strong style={styles.pingValue}>18ms</strong>
          </span>
        </div>
      </div>

      {/* CSS Keyframes for pulse animation */}
      <style>{`
        @keyframes telePulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}</style>
    </footer>
  );
}

const styles = {
  footerContainer: {
    backgroundColor: '#05080f',
    borderTop: '1px solid #1e293b',
    padding: '40px 60px 24px',
    marginTop: 'auto',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  upperMatrix: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '40px',
    marginBottom: '32px',
  },
  brandBlock: {
    maxWidth: '360px',
  },
  brandTitle: {
    fontSize: '13px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '1.5px',
    marginBottom: '12px',
  },
  brandDesc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0,
  },
  linksGrid: {
    display: 'flex',
    gap: '48px',
    flexWrap: 'wrap',
  },
  linkColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  columnHeader: {
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  footerLink: {
    fontSize: '12px',
    color: '#64748b',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    backgroundColor: '#1e293b',
    width: '100%',
    marginBottom: '24px',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  specsGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  securityTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    backgroundColor: '#0c111d',
    border: '1px solid #1e293b',
    padding: '6px 12px',
    borderRadius: '6px',
    letterSpacing: '0.2px',
  },
  tagIcon: {
    fontSize: '12px',
  },
  copyText: {
    fontSize: '11px',
    color: '#475569',
    letterSpacing: '0.1px',
  },
  latencyIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    padding: '6px 14px',
    borderRadius: '20px',
  },
  pulseContainer: {
    position: 'relative',
    width: '8px',
    height: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCore: {
    width: '7px',
    height: '7px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    zIndex: 2,
  },
  pulseWave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'telePulse 2s infinite ease-out',
    zIndex: 1,
  },
  latencyText: {
    fontSize: '11px',
    color: '#64748b',
    letterSpacing: '0.3px',
  },
  pingValue: {
    color: '#10b981',
    fontWeight: '800',
  },
};