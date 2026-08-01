import React, { useState, useEffect } from 'react';

export default function TradeSettlementConsole() {
  const [transactionValue, setTransactionValue] = useState(100000); // USD
  const [slippage, setSlippage] = useState('0.20%');
  const [selectedIncoterm, setSelectedIncoterm] = useState('CIF - Cost, Insurance & Freight');
  const [spotRate] = useState(83.4735);
  const [lockedRate] = useState(83.3795);
  const [status, setStatus] = useState('ACTIVE_LOCK'); // ACTIVE_LOCK or EXPIRED

  const inrValue = (transactionValue * lockedRate).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <span style={styles.sectionBadge}>⚡ AGRI TRADE SETTLEMENT & FX RATE LOCK</span>
        <h2 style={styles.title}>Programmatic Escrow & Currency Margin Protection</h2>
        <p style={styles.subtitle}>
          Shield bulk commodity deals from exchange rate volatility. Lock execution rates during RFQ negotiations with automated document-contingent escrow release.
        </p>
      </div>

      <div style={styles.grid}>
        {/* Left Controller Panel */}
        <div style={styles.controlPanel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Contract Settlement Parameters</span>
            <span style={styles.activeTag}>● DGFT / APEDA CONNECTED</span>
          </div>

          <label style={styles.label}>Deal Value (USD)</label>
          <div style={styles.inputWrapper}>
            <span style={styles.currencyPrefix}>$</span>
            <input 
              type="number" 
              value={transactionValue}
              onChange={(e) => setTransactionValue(Number(e.target.value))}
              style={styles.input}
            />
          </div>

          <label style={styles.label}>Trade Terms (Incoterms 2020)</label>
          <select 
            value={selectedIncoterm} 
            onChange={(e) => setSelectedIncoterm(e.target.value)}
            style={styles.selectInput}
          >
            <option value="FOB">FOB - Free on Board (Nhava Sheva)</option>
            <option value="CIF">CIF - Cost, Insurance & Freight (Rotterdam)</option>
            <option value="CFR">CFR - Cost and Freight (Jebel Ali)</option>
          </select>

          <label style={styles.label}>Max FX Slippage Tolerance</label>
          <select 
            value={slippage} 
            onChange={(e) => setSlippage(e.target.value)}
            style={styles.selectInput}
          >
            <option value="0.10%">0.10% (Strict Institutional Lock)</option>
            <option value="0.20%">0.20% (Standard Agri-Export Standard)</option>
            <option value="0.50%">0.50% (High Volatility Buffer)</option>
          </select>

          <div style={styles.rateFeedBox}>
            <div style={styles.rateRow}>
              <span style={styles.rateLabel}>Live Spot FX Feed:</span>
              <span style={styles.rateSpot}>{spotRate} INR</span>
            </div>
            <div style={styles.rateRow}>
              <span style={styles.rateLabel}>Locked Execution Rate:</span>
              <span style={styles.rateLocked}>{lockedRate} INR</span>
            </div>
          </div>

          <button 
            style={styles.resetBtn}
            onClick={() => setStatus(status === 'ACTIVE_LOCK' ? 'EXPIRED' : 'ACTIVE_LOCK')}
          >
            {status === 'ACTIVE_LOCK' ? 'Simulate Quote Expiration' : 'Lock Execution Rate'}
          </button>
        </div>

        {/* Right Terminal / Event Log */}
        <div style={styles.terminalPanel}>
          <div style={styles.terminalHeader}>
            <div style={styles.statusGroup}>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: status === 'ACTIVE_LOCK' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: status === 'ACTIVE_LOCK' ? '#10b981' : '#ef4444',
                border: status === 'ACTIVE_LOCK' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                STATUS: {status === 'ACTIVE_LOCK' ? 'ESCROW LOCK ACTIVE' : 'QUOTE EXPIRED / ABORTED'}
              </span>
            </div>
            <span style={styles.nodeTag}>NODE ID: AGRI-IN-882</span>
          </div>

          {/* Node Flow Conversion */}
          <div style={styles.nodeFlow}>
            <div style={styles.nodeBox}>
              <span style={styles.nodeRole}>PAYING (Buyer Node)</span>
              <span style={styles.nodeAmount}>${transactionValue.toLocaleString()} <small>USD</small></span>
            </div>
            <div style={styles.flowArrow}>→</div>
            <div style={styles.nodeBox}>
              <span style={styles.nodeRole}>RECEIVING (Exporter Node)</span>
              <span style={styles.nodeAmount}>₹{inrValue} <small>INR</small></span>
            </div>
          </div>

          {/* Event Logs */}
          <div style={styles.logContainer}>
            <div style={styles.logHeader}>SYSTEM COMPLIANCE & ESCROW LOGS</div>
            {status === 'ACTIVE_LOCK' ? (
              <>
                <div style={styles.logRow}>
                  <span style={styles.logTime}>[11:15:43 AM]</span>
                  <span style={styles.logSuccess}>SUCCESS:</span> Cryptographic Escrow Vault allocated for Bill of Lading verification.
                </div>
                <div style={styles.logRow}>
                  <span style={styles.logTime}>[11:14:42 AM]</span>
                  <span style={styles.logSuccess}>VERIFIED:</span> APEDA Phytosanitary & Quality Inspection Certificate attached.
                </div>
                <div style={styles.logRow}>
                  <span style={styles.logTime}>[11:14:12 AM]</span>
                  <span style={styles.logInfo}>INFO:</span> Locked 60-second rate buffer across RBI Sandbox export clearing nodes.
                </div>
              </>
            ) : (
              <>
                <div style={styles.logRow}>
                  <span style={styles.logTime}>[11:15:43 AM]</span>
                  <span style={styles.logError}>CRITICAL:</span> Execution Terminated. Reason: FX Quote Window Expired (60s Limit Reached).
                </div>
                <div style={styles.logRow}>
                  <span style={styles.logTime}>[11:14:42 AM]</span>
                  <span style={styles.logInfo}>INFO:</span> Liquidity buffer released back to vault.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    padding: '3.5rem 1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  sectionBadge: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: '0.05em',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0.5rem 0 0.75rem 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5rem',
    alignItems: 'stretch',
  },
  controlPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
  },
  panelTitle: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  activeTag: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#0284c7',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569',
    margin: '0.85rem 0 0.35rem 0',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: '12px',
    fontWeight: '700',
    color: '#64748b',
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  selectInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#334155',
    outline: 'none',
    boxSizing: 'border-box',
  },
  rateFeedBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    margin: '1.25rem 0',
  },
  rateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    margin: '0.25rem 0',
  },
  rateLabel: {
    color: '#64748b',
  },
  rateSpot: {
    color: '#0284c7',
    fontWeight: '700',
  },
  rateLocked: {
    color: '#16a34a',
    fontWeight: '800',
  },
  resetBtn: {
    marginTop: 'auto',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '0.85rem',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  terminalPanel: {
    backgroundColor: '#05080f',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  statusBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  nodeTag: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: '700',
  },
  nodeFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0c111d',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  nodeBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  nodeRole: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  nodeAmount: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#ffffff',
    marginTop: '0.25rem',
  },
  flowArrow: {
    color: '#0284c7',
    fontSize: '1.2rem',
    fontWeight: '800',
  },
  logContainer: {
    backgroundColor: '#000000',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'monospace',
  },
  logHeader: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#64748b',
    marginBottom: '0.75rem',
    letterSpacing: '0.05em',
  },
  logRow: {
    fontSize: '0.72rem',
    margin: '0.35rem 0',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  logTime: {
    color: '#475569',
    marginRight: '0.5rem',
  },
  logSuccess: {
    color: '#10b981',
    fontWeight: '800',
    marginRight: '0.35rem',
  },
  logError: {
    color: '#ef4444',
    fontWeight: '800',
    marginRight: '0.35rem',
  },
  logInfo: {
    color: '#38bdf8',
    fontWeight: '800',
    marginRight: '0.35rem',
  },
};