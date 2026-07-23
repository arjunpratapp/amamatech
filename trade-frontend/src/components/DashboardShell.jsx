import React from 'react';

export default function TradingDashboardContent({ viewType }) {
  // Mock data tailored for high-volume B2B commodity enterprise trade
  const buyerMetrics = [
    { label: 'Active Letter of Credits', value: '4 Issued', change: '2 Pending Bank Release', status: 'neutral' },
    { label: 'Funds Locked in Escrow', value: '$412,000.00', change: 'For 3 Active Shipments', status: 'success' },
    { label: 'Inbound Freight Cargo', value: '18 Metric Tons', change: 'ETA Chennai Port: 3 Days', status: 'warning' },
    { label: 'Customs Clearances', value: '98.4% Passed', change: '0 Bill of Entry holds', status: 'success' },
  ];

  const supplierMetrics = [
    { label: 'Receivables In Escrow', value: '$272,200.00', change: 'Awaiting Port Outturn Logs', status: 'success' },
    { label: 'Active Fulfillment Orders', value: '7 Shipments', change: '3 Perishable Cold-Chain logs active', status: 'warning' },
    { label: 'DGFT / RCMC Standing', value: 'Fully Valid', change: 'Next renewal: June 2027', status: 'success' },
    { label: 'FSSAI Clearance Rate', value: '100% Compliant', change: 'Batch inspection passes verified', status: 'success' },
  ];

  const liveTransactions = [
    { id: 'TXN-9021', partner: 'Global Grain Corp (Rotterdam)', item: 'Non-Gmo Organic Soybean Bulk', amount: '$184,000.00', status: 'In Escrow', milestone: 'Customs Cleared' },
    { id: 'TXN-8841', partner: 'Amama Cold Storage Ltd (Mumbai)', item: 'Alphonso Mangoes (Perishable)', amount: '$44,500.00', status: 'In Transit', milestone: 'Cold-Chain Monitoring' },
    { id: 'TXN-8710', partner: 'Indo-Gulf Mills (Dubai)', item: 'Premium Basmati Rice (1121)', amount: '$210,000.00', status: 'Settled', milestone: 'Payout Released' },
    { id: 'TXN-8659', partner: 'AgroFarms Ltd (Goa)', item: 'Raw Cashew Nuts', amount: '$81,200.00', status: 'Awaiting Pickup', milestone: 'Phytosanitary Approved' },
  ];

  const metrics = viewType === 'buyer' ? buyerMetrics : supplierMetrics;

  return (
    <div style={styles.wrapper}>
      {/* Dynamic View Header Context */}
      <div style={styles.viewHeader}>
        <div>
          <h2 style={styles.viewTitle}>
            {viewType === 'buyer' ? '🛒 Sourcing Hub & Procurement Desk' : '🚢 Fulfillment Hub & Exporter Panel'}
          </h2>
          <p style={styles.viewSubtitle}>
            Real-time multi-jurisdiction trade monitoring, secure B2B escrows, and customs clearance pipelines.
          </p>
        </div>
        <div style={styles.statusIndicator}>
          <span style={styles.pulseDot}></span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Live Exchange Feed Connected</span>
        </div>
      </div>

      {/* 4-Column Metric Grid */}
      <div style={styles.grid}>
        {metrics.map((m, idx) => (
          <div key={idx} style={styles.card}>
            <span style={styles.cardLabel}>{m.label}</span>
            <span style={styles.cardValue}>{m.value}</span>
            <span style={styles.cardChange}>{m.change}</span>
          </div>
        ))}
      </div>

      {/* Split Analysis & Ledger Row */}
      <div style={styles.splitRow}>
        
        {/* Left Side: Live Freight Status & Escrow Pipeline */}
        <div style={styles.panelLeft}>
          <h3 style={styles.panelTitle}>Active Regulatory Tracking</h3>
          <div style={styles.complianceStack}>
            <div style={styles.complianceRow}>
              <div>
                <span style={styles.compName}>DGFT Importer-Exporter Registry Check</span>
                <span style={styles.compDetail}>IEC Token Status verified with Indian Customs database.</span>
              </div>
              <span style={styles.badgeSuccess}>Active Node</span>
            </div>
            <div style={styles.complianceRow}>
              <div>
                <span style={styles.compName}>Perishable Food Logistics Node (FSSAI)</span>
                <span style={styles.compDetail}>Automatic phytosanitary certificate verification on cross-border bills.</span>
              </div>
              <span style={styles.badgeSuccess}>Compliant</span>
            </div>
            <div style={styles.complianceRow}>
              <div>
                <span style={styles.compName}>Central Bank AD Code Handshake</span>
                <span style={styles.compDetail}>Authorized Dealer forex ledger matching active for wire routes.</span>
              </div>
              <span style={styles.badgePending}>Synched</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Progress / Quick Action Box */}
        <div style={styles.panelRight}>
          <h3 style={styles.panelTitle}>Quick Actions & Documentation</h3>
          <div style={styles.actionGrid}>
            <button style={styles.actionBtn}>📝 Generate Proforma Invoice</button>
            <button style={styles.actionBtn}>⚓ File Bill of Lading (B/L)</button>
            <button style={styles.actionBtn}>🧪 Request Phytosanitary Vetting</button>
            <button style={styles.actionBtn}>🔒 Lock Escrow Installment</button>
          </div>
        </div>
      </div>

      {/* Main Global Trade Ledger */}
      <div style={styles.ledgerContainer}>
        <h3 style={styles.panelTitle}>Active Cross-Border Trade Ledger</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Transaction ID</th>
              <th style={styles.th}>Trading Counterparty</th>
              <th style={styles.th}>Commodity Cargo Description</th>
              <th style={styles.th}>Total Value (USD)</th>
              <th style={styles.th}>Escrow Status</th>
              <th style={styles.th}>Current Milestone</th>
            </tr>
          </thead>
          <tbody>
            {liveTransactions.map((t, idx) => (
              <tr key={idx} style={styles.tableBodyRow}>
                <td style={{...styles.td, fontWeight: '700', color: '#f59e0b'}}>{t.id}</td>
                <td style={styles.td}>{t.partner}</td>
                <td style={styles.td}>{t.item}</td>
                <td style={{...styles.td, fontWeight: '600', color: '#f1f5f9'}}>{t.amount}</td>
                <td style={styles.td}>
                  <span style={t.status === 'Settled' ? styles.statusBadgeGreen : styles.statusBadgeAmber}>
                    {t.status}
                  </span>
                </td>
                <td style={{...styles.td, color: '#94a3b8', fontSize: '13px'}}>{t.milestone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: '32px' },
  viewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px' },
  viewTitle: { fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: 0 },
  viewSubtitle: { fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' },
  statusIndicator: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#05070f', border: '1px solid #1e293b', padding: '8px 14px', borderRadius: '20px' },
  pulseDot: { width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10b981' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  card: { backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardLabel: { fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: '4px 0' },
  cardChange: { fontSize: '12px', color: '#10b981' },
  splitRow: { display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' },
  panelLeft: { backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' },
  panelRight: { backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' },
  panelTitle: { fontSize: '15px', fontWeight: '700', color: '#f8fafc', margin: '0 0 16px', letterSpacing: '0.3px' },
  complianceStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  complianceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#05070f', border: '1px solid #1e293b', padding: '14px 16px', borderRadius: '8px' },
  compName: { fontSize: '13px', fontWeight: '600', color: '#f1f5f9', display: 'block' },
  compDetail: { fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' },
  badgeSuccess: { fontSize: '11px', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: '6px' },
  badgePending: { fontSize: '11px', fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', padding: '4px 10px', borderRadius: '6px' },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  actionBtn: { padding: '14px', backgroundColor: '#05070f', border: '1px solid #1e293b', borderRadius: '8px', color: '#cbd5e1', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', ':hover': { borderColor: '#d97706' } },
  ledgerContainer: { backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeaderRow: { borderBottom: '1px solid #1e293b' },
  th: { padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableBodyRow: { borderBottom: '1px solid #1f2937', backgroundColor: '#111827' },
  td: { padding: '16px', fontSize: '14px', color: '#cbd5e1' },
  statusBadgeAmber: { fontSize: '11px', fontWeight: '700', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '4px 10px', borderRadius: '6px' },
  statusBadgeGreen: { fontSize: '11px', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: '6px' }
};