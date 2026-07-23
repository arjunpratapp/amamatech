import React from 'react';

export default function HomeView({ onNavigate }) {
  return (
    <div style={styles.placeholderView}>
      <h2 style={styles.viewTitle}>Global Trade Compliance Escrow</h2>
      <p style={styles.viewSubtitle}>
        Connecting certified Indian suppliers and global buyers through real-time regulatory document vetting.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button style={styles.ctaBtn} onClick={() => onNavigate('REGISTER')}>
          Begin Corporate KYB Vetting
        </button>
        <button style={{...styles.ctaBtn, backgroundColor: '#1f2937'}} onClick={() => onNavigate('LOGIN')}>
          Access Trading Hub
        </button>
      </div>
    </div>
  );
}

const styles = {
  placeholderView: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' },
  viewTitle: { fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#f8fafc', letterSpacing: '-0.5px' },
  viewSubtitle: { fontSize: '15px', color: '#94a3b8', maxWidth: '700px', marginBottom: '32px', lineHeight: '1.6' },
  ctaBtn: { backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
};