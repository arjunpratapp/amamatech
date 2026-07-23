import React from 'react';

export default function AboutCompanyNode({ onNavigateToRegister }) {
  return (
    <div style={styles.containerWrap}>
      {/* Hero Brand Section */}
      <div style={styles.heroSection}>
        <span style={styles.pillBadge}>✦ NEXT-GEN SECURE B2B DISPATCH ARCHITECTURE</span>
        <h1 style={styles.heroTitle}>AMAMA GLOBAL TRADE</h1>
        <p style={styles.heroSubtitle}>
          Eliminating cross-border trade latency, intermediary overhead, and clearing risks via automated multi-signature escrow pipelines.
        </p>
        <button onClick={onNavigateToRegister} style={styles.ctaButton}>
          Initialize Node Registration ➔
        </button>
      </div>

      {/* Infrastructure Core Matrix */}
      <div style={styles.gridSection}>
        <div style={styles.featureCard}>
          <span style={styles.cardIcon}>🛡️</span>
          <h3 style={styles.cardTitle}>Multi-Sig Escrow Vaults</h3>
          <p style={styles.cardText}>
            Direct programmatic integration with RBI-monitored forex routing and global settlement corridors. Capital is cryptographically locked, protecting operational margins against international spot rate volatility.
          </p>
        </div>

        <div style={styles.featureCard}>
          <span style={styles.cardIcon}>⚡</span>
          <h3 style={styles.cardTitle}>Sub-Second Execution</h3>
          <p style={styles.cardText}>
            Automated verification nodes cross-check regulatory frameworks, customs allocations, and liquidity verification checks in under <strong style={{color: '#4ade80'}}>0.42 seconds</strong>.
          </p>
        </div>

        <div style={styles.featureCard}>
          <span style={styles.cardIcon}>📜</span>
          <h3 style={styles.cardTitle}>Compliance Vetting Node</h3>
          <p style={styles.cardText}>
            Direct API handshakes with DGFT, GSTIN, and international trade registries. Instantly matches and verifies IEC codes, AD Code letters, FSSAI certificates, and standard industrial rules.
          </p>
        </div>
      </div>

      {/* Operational Flow Visualization Segment */}
      <div style={styles.workflowPanel}>
        <h3 style={styles.workflowTitle}>Dual-Sided Clearing Pipeline Architecture</h3>
        <div style={styles.flowWrapper}>
          
          <div style={styles.flowNode}>
            <div style={{...styles.nodeBadge, backgroundColor: '#fbbf24'}}>🚢 SUPPLIER DESK</div>
            <h4 style={styles.nodeTitle}>Export Manufacturing</h4>
            <p style={styles.nodeText}>Industrial clusters trace maritime logistics, pass custom verifications, and deploy digital twin cargo logs.</p>
          </div>

          <div style={styles.flowConnector}>➔</div>

          <div style={styles.flowNode}>
            <div style={{...styles.nodeBadge, backgroundColor: '#ec4899'}}>🏛️ CLEARING HUB</div>
            <h4 style={styles.nodeTitle}>Automated Compliance</h4>
            <p style={styles.nodeText}>Dual-signature smart contracts bind target rates, match spot valuations, and initialize escrow routing lines.</p>
          </div>

          <div style={styles.flowConnector}>➔</div>

          <div style={styles.flowNode}>
            <div style={{...styles.nodeBadge, backgroundColor: '#38bdf8'}}>🛒 BUYER DESK</div>
            <h4 style={styles.nodeTitle}>Global Procurement</h4>
            <p style={styles.nodeText}>Conglomerates deposit high-capacity liquidity buffers directly into securely ring-fenced transit nodes.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

// Electric Sapphire & Neon Gradient Theme Styles
const styles = {
  containerWrap: {
    flex: 1,
    width: '100%',
    padding: '60px 40px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '50px'
  },
  heroSection: {
    textAlign: 'center',
    maxWidth: '850px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  pillBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    border: '1px solid #38bdf8',
    color: '#38bdf8',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '1px'
  },
  heroTitle: {
    fontSize: '46px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '10px 0 0 0',
    letterSpacing: '-1px',
    textShadow: '0 4px 20px rgba(37, 99, 235, 0.6)'
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#93c5fd',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
  },
  ctaButton: {
    backgroundColor: '#ec4899',
    color: '#ffffff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.5)',
    transition: 'transform 0.2s'
  },
  gridSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featureCard: {
    backgroundColor: '#1e293b',
    border: '2px solid #3b82f6',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
  },
  cardIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 12px 0'
  },
  cardText: {
    fontSize: '13px',
    color: '#93c5fd',
    lineHeight: '1.6',
    margin: 0
  },
  workflowPanel: {
    backgroundColor: '#0f172a',
    border: '2px solid #2563eb',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  workflowTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    margin: '0 0 36px 0',
    letterSpacing: '-0.25px'
  },
  flowWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  flowNode: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    flex: '1',
    minWidth: '245px',
    boxSizing: 'border-box'
  },
  nodeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: '12px'
  },
  nodeTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0'
  },
  nodeText: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: 0
  },
  flowConnector: {
    fontSize: '24px',
    color: '1D4F23',
    fontWeight: '900',
    userSelect: 'none',
    textAlign: 'center'
  }
};