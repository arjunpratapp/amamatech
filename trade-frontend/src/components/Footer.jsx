import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footerContainer}>
      {/* Upper Layer: Corporate Hub & Quick Actions */}
      <div style={styles.upperMatrix}>
        <div style={styles.brandBlock}>
          <div style={styles.brandTitle}>AMAMA GLOBAL TRADE</div>
          <p style={styles.brandDesc}>
            Programmatic cross-border smart escrow infrastructure operating secure, multi-signature trade routing networks.
          </p>
        </div>
        
        <div style={styles.linksGrid}>
          <div style={styles.linkColumn}>
            <span style={styles.columnHeader}>Network Architecture</span>
            <a href="#pipelines" style={styles.footerLink}>Clearing Nodes</a>
            <a href="#escrow" style={styles.footerLink}>Escrow Vaults</a>
            <a href="#fees" style={styles.footerLink}>Liquidity Margins</a>
          </div>
          <div style={styles.linkColumn}>
            <span style={styles.columnHeader}>Governance & Compliance</span>
            <a href="#dgft" style={styles.footerLink}>DGFT Handshakes</a>
            <a href="#rbi" style={styles.footerLink}>RBI Sandbox Protocol</a>
            <a href="#legal" style={styles.footerLink}>Terms of Settlement</a>
          </div>
        </div>
      </div>

      <div style={styles.divider}></div>

      {/* Lower Layer: Security Specs, Telemetry, & Legal */}
      <div style={styles.footerRow}>
        {/* Left: Compliance Badges */}
        <div style={styles.specsGroup}>
          <div style={styles.securityTag}>
            <span style={styles.tagIcon}>🛡️</span> RBI Sandbox Authorized
          </div>
          <div style={styles.securityTag}>
            <span style={styles.tagIcon}>🔒</span> ISO 27001 Secured
          </div>
          <div style={styles.securityTag}>
            <span style={styles.tagIcon}>🔗</span> Cryptographic Node V2
          </div>
        </div>

        {/* Center: Legal Attributions */}
        <div style={styles.copyText}>
          © 2026 Sovereign Escrow Infrastructure. Real-Time Trade Interface Module. All rights reserved.
        </div>

        {/* Right: Dynamic Operational Telemetry */}
        <div style={styles.latencyIndicator}>
          <div style={styles.pulseContainer}>
            <div style={styles.pulseCore}></div>
            <div style={styles.pulseWave}></div>
          </div>
          <span style={styles.latencyText}>
            DGFT Engine Ping: <strong style={styles.pingValue}>21ms</strong>
          </span>
        </div>
      </div>

      {/* Injecting CSS Keyframes dynamically for the real pulse radar effect */}
      <style>{`
        @keyframes tele Pulse {
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
    backgroundColor: '#05080f', // Grounded deep contrast panel dark
    borderTop: '1px solid #1e293b',
    padding: '40px 60px 24px',
    marginTop: 'auto',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
  },
  upperMatrix: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '40px',
    marginBottom: '32px'
  },
  brandBlock: {
    maxWidth: '360px'
  },
  brandTitle: {
    fontSize: '13px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '1.5px',
    marginBottom: '12px'
  },
  brandDesc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0
  },
  linksGrid: {
    display: 'flex',
    gap: '64px',
    flexWrap: 'wrap'
  },
  linkColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  columnHeader: {
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  footerLink: {
    fontSize: '12px',
    color: '#64748b',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer'
  },
  divider: {
    height: '1px',
    backgroundColor: '#1e293b',
    width: '100%',
    marginBottom: '24px'
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  specsGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
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
    letterSpacing: '0.2px'
  },
  tagIcon: {
    fontSize: '12px'
  },
  copyText: {
    fontSize: '11px',
    color: '#475569',
    letterSpacing: '0.1px'
  },
  latencyIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    padding: '6px 14px',
    borderRadius: '20px'
  },
  pulseContainer: {
    position: 'relative',
    width: '8px',
    height: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseCore: {
    width: '7px',
    height: '7px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    zIndex: 2
  },
  pulseWave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'telePulse 2s infinite ease-out',
    zIndex: 1
  },
  latencyText: {
    fontSize: '11px',
    color: '#64748b',
    letterSpacing: '0.3px'
  },
  pingValue: {
    color: '#10b981',
    fontWeight: '800'
  }
};