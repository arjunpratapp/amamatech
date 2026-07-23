import React from 'react';

export default function HomePortal({ onGoToRegister, onGoToLogin }) {
  return (
    <div style={styles.heroContainer}>
      <div style={styles.gridOverlay}></div>
      <div style={styles.heroContent}>
        <span style={styles.platformBadge}>🔥 SMART DEPLOYMENT &amp; ESCROW ENGINE</span>
        <h1 style={styles.mainHeadline}>
          Direct Indian Sourcing &amp; <br />
          <span style={{ color: '#3b82f6' }}>Escrow Guarantee Networks</span>
        </h1>
        <p style={styles.mainDescription}>
          The digital trade desk matching verified Indian industrial exporters and global buyers. 
          Settle contracts, process bills of lading, and route funds automatically with integrated DGFT systems.
        </p>
        <div style={styles.buttonWrapper}>
          <button onClick={onGoToRegister} style={styles.primaryBtn}>
            Register Enterprise Node
          </button>
          <button onClick={onGoToLogin} style={styles.secondaryBtn}>
            Access Portal Gateway
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  heroContainer: { position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '120px 24px', backgroundColor: '#05070f' },
  gridOverlay: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(11, 15, 25, 0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(11, 15, 25, 0.7) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3, pointerEvents: 'none' },
  heroContent: { position: 'relative', zIndex: 5, maxWidth: '800px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  platformBadge: { backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px', padding: '6px 14px', color: '#3b82f6', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '24px' },
  mainHeadline: { fontSize: '48px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', margin: '0 0 16px 0', lineHeight: '1.2' },
  mainDescription: { fontSize: '16px', color: '#94a3b8', lineHeight: '1.7', margin: '0 0 36px 0', maxWidth: '620px' },
  buttonWrapper: { display: 'flex', gap: '16px' },
  primaryBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)' },
  secondaryBtn: { backgroundColor: '#111827', border: '1px solid #1e293b', color: '#f8fafc', padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }
};