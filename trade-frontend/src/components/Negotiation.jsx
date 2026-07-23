import React, { useState } from 'react';

export default function Negotiation({ user, orderId = 'AMAMA-7281', onAgreementSettled, onCancel }) {
  const isSupplier = user.role === 'SUPPLIER';
  
  // Dynamic Theme Palette Extraction matching parent nodes
  const themeAccent = isSupplier ? '#fbbf24' : '#ec4899';
  const themeGlow = isSupplier ? 'rgba(251, 191, 36, 0.15)' : 'rgba(236, 72, 153, 0.15)';
  const peerRoleLabel = isSupplier ? 'Global Buyer' : 'Factory Supplier';

  // Live Bid Tracking States
  const [currentOffer, setCurrentOffer] = useState({
    pricePerTon: 420.00,
    volumeTons: 2500,
    deliveryDays: 45
  });
  
  const [counterValue, setCounterValue] = useState('');
  const [proposalLog, setProposalLog] = useState([
    { id: 1, sender: 'BUYER', price: 395.00, timestamp: '10:42:15 AM', text: 'Initial procurement baseline bid.' },
    { id: 2, sender: 'SUPPLIER', price: 420.00, timestamp: '11:05:32 AM', text: 'Standard mill floor price margin constraint.' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed Totals
  const totalValuation = currentOffer.pricePerTon * currentOffer.volumeTons;

  const handleProposeCounter = (e) => {
    e.preventDefault();
    if (!counterValue || isNaN(counterValue)) return;

    setIsSubmitting(true);
    
    // Simulate structural network latency processing the counter-proposal
    setTimeout(() => {
      const newPrice = parseFloat(counterValue);
      
      setCurrentOffer(prev => ({ ...prev, pricePerTon: newPrice }));
      setProposalLog(prev => [
        {
          id: Date.now(),
          sender: user.role,
          price: newPrice,
          timestamp: new Date().toLocaleTimeString(),
          text: `Counter-proposal locked from ${user.companyName}`
        },
        ...prev
      ]);
      setCounterValue('');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div style={styles.negotiationContainer}>
      {/* Header Matrix Control */}
      <div style={{ ...styles.deskHeader, borderBottom: `2px solid ${themeAccent}` }}>
        <div>
          <h2 style={styles.title}>Live Trade Negotiation Desk</h2>
          <p style={styles.subtitle}>
            Active Intermediary Channel ⚡ Order Segment ID: <strong style={{ color: '#ffffff' }}>{orderId}</strong>
          </p>
        </div>
        <div style={styles.headerMeta}>
          <span style={{ ...styles.roleBadge, backgroundColor: themeAccent }}>
            {isSupplier ? '🚢 SUPPLIER TERMINAL' : '🛒 BUYER GATEWAY'}
          </span>
          <button onClick={onCancel} style={styles.cancelLinkBtn}>✕ Abort Bid</button>
        </div>
      </div>

      {/* Main Core Layout Split */}
      <div style={styles.layoutSplit}>
        
        {/* Left Column: Live Financial Metrics & Counter Action Form */}
        <div style={styles.leftCol}>
          <div style={styles.metricCard}>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>ACTIVE VALUATION UNIT (PER METRIC TON)</span>
              <span style={{ ...styles.metricValue, color: themeAccent }}>${currentOffer.pricePerTon.toFixed(2)} USD</span>
            </div>
            <div style={styles.metricDivider}></div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>TOTAL CONTRACT TARGET VALUE</span>
              <span style={styles.metricValue}>${totalValuation.toLocaleString()} USD</span>
            </div>
            <div style={styles.metricDivider}></div>
            <div style={styles.gridMini}>
              <div>
                <span style={styles.metricLabel}>ALLOCATED CARGO</span>
                <span style={styles.subMetricValue}>{currentOffer.volumeTons} MT</span>
              </div>
              <div>
                <span style={styles.metricLabel}>TRANSIT TIME WINDOW</span>
                <span style={styles.subMetricValue}>{currentOffer.deliveryDays} Days</span>
              </div>
            </div>
          </div>

          {/* Form Action Layer */}
          <form onSubmit={handleProposeCounter} style={styles.actionForm}>
            <h3 style={styles.sectionTitle}>Transmit Counter-Proposal</h3>
            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>New Target Price ($/Ton)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  disabled={isSubmitting}
                  placeholder={`e.g. ${isSupplier ? '435.00' : '410.00'}`}
                  value={counterValue}
                  onChange={(e) => setCounterValue(e.target.value)}
                  style={styles.numericInput}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ ...styles.proposeBtn, backgroundColor: '#0f172a', border: `2px solid ${themeAccent}`, color: '#ffffff' }}
              >
                {isSubmitting ? 'ROUTING...' : 'Broadcast Bid'}
              </button>
            </div>

            <button 
              type="button" 
              onClick={onAgreementSettled}
              style={{ ...styles.executeEscrowBtn, backgroundColor: themeAccent, boxShadow: `0 4px 15px ${themeGlow}` }}
            >
              🤝 Freeze Pricing &amp; Initialize Escrow Contract
            </button>
          </form>
        </div>

        {/* Right Column: Historical Audit Pipeline Trail */}
        <div style={styles.rightCol}>
          <h3 style={styles.sectionTitle}>Dual-Signature Audit History</h3>
          <div style={styles.timelineStream}>
            {proposalLog.map((log) => {
              const logIsSelf = log.sender === user.role;
              return (
                <div key={log.id} style={styles.timelineCard}>
                  <div style={styles.timelineHeader}>
                    <span style={{ 
                      ...styles.miniSenderBadge, 
                      backgroundColor: log.sender === 'SUPPLIER' ? '#fbbf24' : '#ec4899',
                      color: '#090d16'
                    }}>
                      {log.sender}
                    </span>
                    <span style={styles.timeToken}>{log.timestamp}</span>
                  </div>
                  <div style={styles.timelineBody}>
                    <span style={styles.priceLogText}>Proposed Settlement Rate: <strong>${log.price.toFixed(2)} / MT</strong></span>
                    <p style={styles.textLogDesc}>{log.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  negotiationContainer: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '32px',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  deskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  title: { fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  headerMeta: { display: 'flex', alignItems: 'center', gap: '16px' },
  roleBadge: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '900',
    color: '#090d16',
    letterSpacing: '0.5px'
  },
  cancelLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#f43f5e',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  layoutSplit: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap'
  },
  leftCol: { flex: '1.2', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' },
  rightCol: { flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' },
  
  metricCard: {
    backgroundColor: '#0f172a',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  metricItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  metricLabel: { fontSize: '10px', fontWeight: '800', color: '#64748b', letterSpacing: '0.75px', textTransform: 'uppercase' },
  metricValue: { fontSize: '26px', fontWeight: '900', color: '#ffffff' },
  metricDivider: { height: '1px', backgroundColor: '#334155', width: '100%' },
  gridMini: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  subMetricValue: { fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'block', marginTop: '4px' },
  
  sectionTitle: { fontSize: '14px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px 0' },
  actionForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  inputLabel: { fontSize: '11px', fontWeight: '800', color: '#94a3b8' },
  numericInput: {
    backgroundColor: '#0f172a',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%'
  },
  proposeBtn: {
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  executeEscrowBtn: {
    border: 'none',
    color: '#090d16',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '900',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'transform 0.15s ease'
  },
  
  timelineStream: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '380px',
    overflowY: 'auto',
    paddingRight: '6px'
  },
  timelineCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  timelineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  miniSenderBadge: { fontSize: '9px', fontWeight: '900', padding: '3px 6px', borderRadius: '4px', letterSpacing: '0.5px' },
  timeToken: { fontSize: '11px', color: '#64748b' },
  timelineBody: { display: 'flex', flexDirection: 'column', gap: '2px' },
  priceLogText: { fontSize: '13px', color: '#f8fafc' },
  textLogDesc: { fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: '1.4' }
};