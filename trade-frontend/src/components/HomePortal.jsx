import React, { useState } from 'react';

export default function HomePortal({ onGoToRegister, onGoToLogin }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <div style={styles.heroContainer}>
      {/* Background Cyber Grid & Glow Effects */}
      <div style={styles.gridOverlay}></div>
      <div style={styles.ambientGlowPrimary}></div>
      <div style={styles.ambientGlowSecondary}></div>

      <div style={styles.heroContent}>
        {/* Top Status Pill */}
        <div style={styles.platformBadge}>
          <span style={styles.pulsingDot}></span>
          <span>SMART DEPLOYMENT &amp; ESCROW ENGINE</span>
        </div>

        {/* Main Terminal Headline */}
        <h1 style={styles.mainHeadline}>
          Direct Indian Sourcing &amp; <br />
          <span style={styles.gradientText}>Escrow Guarantee Networks</span>
        </h1>

        {/* Subtitle */}
        <p style={styles.mainDescription}>
          The digital trade desk matching verified Indian industrial exporters and global buyers. 
          Settle contracts, process bills of lading, and route funds automatically with integrated DGFT systems.
        </p>

        {/* Dynamic Metric Ticker Strip */}
        <div style={styles.miniStatsBar}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>CLEARING SPEED</span>
            <span style={styles.statValue}>&lt; 0.42s</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>COMPLIANCE MATRIX</span>
            <span style={styles.statValueGreen}>BO-2 / BO-3 ACTIVE</span>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>ROUTING CORRIDOR</span>
            <span style={styles.statValueCyan}>RBI / ADGM INTEGRATED</span>
          </div>
        </div>

        {/* Call to Actions */}
        <div style={styles.buttonWrapper}>
          <button 
            onClick={onGoToRegister} 
            onMouseEnter={() => setHoveredBtn('primary')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.primaryBtn,
              transform: hoveredBtn === 'primary' ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hoveredBtn === 'primary' 
                ? '0 8px 25px rgba(56, 189, 248, 0.4)' 
                : '0 4px 16px rgba(56, 189, 248, 0.25)'
            }}
          >
            ⚡ Register Enterprise Node
          </button>

          <button 
            onClick={onGoToLogin} 
            onMouseEnter={() => setHoveredBtn('secondary')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.secondaryBtn,
              transform: hoveredBtn === 'secondary' ? 'translateY(-2px)' : 'translateY(0)',
              borderColor: hoveredBtn === 'secondary' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.12)',
              backgroundColor: hoveredBtn === 'secondary' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.6)'
            }}
          >
            🔐 Access Portal Gateway
          </button>
        </div>
      </div>
    </div>
  );
}

// --- TRADING TERMINAL & GLASSMORPHIC STYLES ---
const styles = {
  heroContainer: { 
    position: 'relative', 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden', 
    padding: '120px 24px', 
    backgroundColor: '#030712',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  gridOverlay: { 
    position: 'absolute', 
    inset: 0, 
    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
    backgroundSize: '40px 40px', 
    opacity: 0.8, 
    pointerEvents: 'none' 
  },
  ambientGlowPrimary: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '300px',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    filter: 'blur(100px)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  ambientGlowSecondary: {
    position: 'absolute',
    bottom: '10%',
    right: '25%',
    width: '350px',
    height: '250px',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    filter: 'blur(90px)',
    borderRadius: '50%',
    pointerEvents: 'none'
  },
  heroContent: { 
    position: 'relative', 
    zIndex: 5, 
    maxWidth: '840px', 
    textAlign: 'center', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  platformBadge: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)', 
    border: '1px solid rgba(56, 189, 248, 0.25)', 
    borderRadius: '20px', 
    padding: '6px 16px', 
    color: '#38bdf8', 
    fontSize: '11px', 
    fontWeight: '800', 
    letterSpacing: '0.8px', 
    marginBottom: '28px' 
  },
  pulsingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8',
    boxShadow: '0 0 8px #38bdf8'
  },
  mainHeadline: { 
    fontSize: '52px', 
    fontWeight: '900', 
    color: '#ffffff', 
    letterSpacing: '-1.5px', 
    margin: '0 0 20px 0', 
    lineHeight: '1.15' 
  },
  gradientText: {
    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  mainDescription: { 
    fontSize: '16px', 
    color: '#94a3b8', 
    lineHeight: '1.7', 
    margin: '0 0 32px 0', 
    maxWidth: '640px' 
  },
  miniStatsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '12px 24px',
    marginBottom: '40px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },
  statLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.6px'
  },
  statValue: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'ui-monospace, monospace'
  },
  statValueGreen: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#10b981',
    fontFamily: 'ui-monospace, monospace'
  },
  statValueCyan: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#38bdf8',
    fontFamily: 'ui-monospace, monospace'
  },
  statDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  buttonWrapper: { 
    display: 'flex', 
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  primaryBtn: { 
    backgroundColor: '#0284c7', 
    color: '#ffffff', 
    border: 'none', 
    padding: '14px 28px', 
    borderRadius: '8px', 
    fontSize: '13px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.4px'
  },
  secondaryBtn: { 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    border: '1px solid rgba(255, 255, 255, 0.12)', 
    color: '#f8fafc', 
    padding: '14px 28px', 
    borderRadius: '8px', 
    fontSize: '13px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    letterSpacing: '0.4px'
  }
};

