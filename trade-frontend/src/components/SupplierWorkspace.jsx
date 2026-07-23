import React, { useState, useEffect } from 'react';
import liveRateService from '../utils/liveRateService';
import LiveRateTicker from './LiveRateTicker';

export default function SupplierWorkspace({ user }) {
  const [currentSpotRate, setCurrentSpotRate] = useState(liveRateService.getCurrentRate());
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    return liveRateService.subscribe((rate) => setCurrentSpotRate(rate));
  }, []);

  const [cargoList, setCargoList] = useState([
    { id: 'EXP-2026-NJD92', destination: 'Hamburg Central Port (DE)', value: '$142,000.00', status: 'Clearance Passed', color: '#10b981' },
    { id: 'EXP-2026-LAL04', destination: 'Port of Long Beach (US)', value: '$98,500.00', status: 'Customs Hold', color: '#fbbf24' },
  ]);

  const [completedOrders, setCompletedOrders] = useState([
    { id: 'EXP-2026-CMP01', destination: 'Rotterdam Gateway (NL)', value: '$210,000.00', closedDate: '2026-06-12', settlementStatus: 'Funds Disbursed' },
    { id: 'EXP-2026-CMP02', destination: 'Port of Tokyo (JP)', value: '$185,400.00', closedDate: '2026-05-28', settlementStatus: 'Funds Disbursed' },
  ]);

  const [pendingPriceLocks, setPendingPriceLocks] = useState([
    { proposalId: 'PROP-2026-88B', buyerName: 'Global Buy Logistics GmbH', commodity: 'Premium Industrial Grade Steel Wheels', quantity: '5,000 Units', lockedUnitPrice: '$78.50 USD', totalEscrowTarget: '$392,500.00' },
    { proposalId: 'PROP-2026-91A', buyerName: 'AmeriCargo Corp', commodity: 'High-Density Polyethylene Raw Resin', quantity: '12 Metric Tons', lockedUnitPrice: '$1,450.00 USD', totalEscrowTarget: '$17,400.00' }
  ]);

  const [escrowLocked, setEscrowLocked] = useState(8432900);
  const [isLocking, setIsLocking] = useState(null);

  const totalCompletedValue = completedOrders.reduce((acc, curr) => {
    return acc + parseFloat(curr.value.replace(/[^0-9.]/g, ''));
  }, 0);

  const finalSignature = user?.authoritySignature || "SIG-DGFT-K82M11N-2026";

  const handleExecutePriceLock = (proposalId) => {
    setIsLocking(proposalId);
    const rateLockedAtDealMoment = currentSpotRate; 

    setTimeout(() => {
      const acceptedProposal = pendingPriceLocks.find(p => p.proposalId === proposalId);
      if (acceptedProposal) {
        setPendingPriceLocks(prev => prev.filter(p => p.proposalId !== proposalId));
        setCargoList(prev => [...prev, { id: acceptedProposal.proposalId.replace('PROP', 'EXP'), destination: 'Awaiting Port Route Allocation', value: acceptedProposal.totalEscrowTarget, status: 'Escrow Locked & Awaiting Dispatch', color: '#06b6d4' }]);

        const usdValue = parseFloat(acceptedProposal.totalEscrowTarget.replace(/[^0-9.]/g, ''));
        setEscrowLocked(prev => prev + (usdValue * rateLockedAtDealMoment));
        alert(`🔐 PRICE LOCK ACTIVE: Contract deployed.\n\nLocked rate: 1 USD = ${rateLockedAtDealMoment.toFixed(4)} INR`);
      }
      setIsLocking(null);
    }, 1200);
  };

  const getCardStyle = (id, accentBorderColor) => ({
    ...styles.metricCard,
    borderLeft: `4px solid ${accentBorderColor}`,
    transform: hoveredCard === id ? 'translateY(-4px)' : 'translateY(0)',
    borderColor: hoveredCard === id ? accentBorderColor : '#1e293b',
    boxShadow: hoveredCard === id ? '0 12px 20px rgba(0,0,0,0.5)' : 'none'
  });

  return (
    <div style={styles.fullPageDashboard}>
      <LiveRateTicker />

      {/* Header featuring the Authority Validation Badge */}
      <div style={styles.dashboardHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={styles.viewTitle}>{user?.companyName || 'Amama Exporters Pvt Ltd'}</h2>
              
              {/* HIGH-VISIBILITY AUTHORITY VERIFICATION SEAL */}
              <div style={styles.miniAuthorityBadge}>
                <span style={styles.badgeIcon}>🛡️</span>
                <div>
                  <div style={styles.badgeLabelText}>DGFT &amp; GSTIN VERIFIED PROFILE</div>
                  <div style={styles.badgeHash}>{finalSignature}</div>
                </div>
              </div>
            </div>
            <p style={styles.viewSubtitle}>
              Operational Base Vector: Mumbai Customs Port HQ (JNPT) • Security ID: <code style={styles.inlineCode}>{user?.companyId || 'AMAMA_EXP_991'}</code>
            </p>
          </div>
        </div>
      </div>

      {pendingPriceLocks.length > 0 && (
        <div style={styles.provisionSection}>
          <h3 style={styles.provisionTitle}>🛡️ Cryptographic Price-Lock Execution Desk</h3>
          <p style={styles.provisionSubtitle}>The rates below represent absolute global spot offers guaranteed by buyer liquidity reserves.</p>
          <div style={styles.proposalGrid}>
            {pendingPriceLocks.map((prop) => (
              <div key={prop.proposalId} style={styles.proposalCard}>
                <div style={styles.proposalHeader}>
                  <span style={styles.proposalIdTag}>{prop.proposalId}</span>
                  <span style={styles.fxTag}>Live Lock Rate: {currentSpotRate.toFixed(4)}</span>
                </div>
                <div style={styles.proposalBody}>
                  <div style={styles.buyerLabel}>{prop.buyerName}</div>
                  <div style={styles.commodityDetail}>{prop.commodity}</div>
                  <div style={styles.priceDataRow}>
                    <div>
                      <div style={styles.priceSubhead}>Unit Cost</div>
                      <div style={styles.priceValueText}>{prop.lockedUnitPrice}</div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={styles.priceSubhead}>Total Value</div>
                      <div style={{...styles.priceValueText, color: '#ffffff'}}>{prop.totalEscrowTarget}</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleExecutePriceLock(prop.proposalId)} disabled={isLocking !== null} style={styles.lockBtn}>
                  {isLocking === prop.proposalId ? 'Binding Escrow Ledger...' : '🔐 Sign & Lock Firm Price'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.wideMetricsGrid}>
        <div style={getCardStyle('closed', '#10b981')} onMouseEnter={() => setHoveredCard('closed')} onMouseLeave={() => setHoveredCard(null)}>
          <span style={styles.cardIcon}>✅</span>
          <div style={styles.cardHeader}>Sovereign Closed Pipelines</div>
          <div style={styles.stat}>{completedOrders.length} Completed</div>
          <div style={styles.statSub}>${totalCompletedValue.toLocaleString('en-US')}.00</div>
          <p style={styles.cardBody}>Supply agreements verified and securely settled across RBI-monitored frameworks.</p>
        </div>

        <div style={getCardStyle('transit', '#06b6d4')} onMouseEnter={() => setHoveredCard('transit')} onMouseLeave={() => setHoveredCard(null)}>
          <span style={styles.cardIcon}>🚢</span>
          <div style={styles.cardHeader}>Freight In Transit Log</div>
          <div style={styles.stat}>{cargoList.length} Active Batches</div>
          <p style={styles.cardBody}>Active maritime logistics containers tracing inbound toward designated global ports.</p>
        </div>
        
        <div style={getCardStyle('escrow', '#fbbf24')} onMouseEnter={() => setHoveredCard('escrow')} onMouseLeave={() => setHoveredCard(null)}>
          <span style={styles.cardIcon}>🏦</span>
          <div style={styles.cardHeader}>Secured Escrow Volume</div>
          <div style={styles.stat}>₹{escrowLocked.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div style={styles.securedStatus}>🔒 RESERVE: MULTI-SIG COLD LOCK</div>
          <p style={styles.cardBody}>Funds systematically collateralized across state-regulated transit vaults.</p>
        </div>
      </div>

      <div style={styles.splitContentTableSection}>
        <div style={styles.tablePanelLarge}>
          <h3 style={styles.panelTitle}>Active Cargo Freight Despatch Registry</h3>
          <div style={styles.pseudoTableContainer}>
            <div style={styles.tableHeaderRow}>
              <div style={{flex: 2}}>Contract Ref</div>
              <div style={{flex: 3}}>Destination Node</div>
              <div style={{flex: 2}}>Locked Value</div>
              <div style={{flex: 2}}>Escrow Status</div>
            </div>
            {cargoList.map((cargo) => (
              <div key={cargo.id} style={styles.tableDataRow}>
                <div style={{flex: 2, fontWeight: '800', color: '#ffffff'}}>{cargo.id}</div>
                <div style={{flex: 3, color: '#94a3b8'}}>{cargo.destination}</div>
                <div style={{flex: 2, color: '#fbbf24', fontWeight: '800'}}>{cargo.value}</div>
                <div style={{flex: 2, display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cargo.color, boxShadow: `0 0 8px ${cargo.color}` }}></span>
                  <span style={{ color: cargo.color, fontWeight: '800', fontSize: '12px' }}>{cargo.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fullPageDashboard: { flex: 1, width: '100%', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '32px', backgroundColor: '#05080f' },
  dashboardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '24px' },
  viewTitle: { fontSize: '24px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', margin: 0 },
  viewSubtitle: { fontSize: '12.5px', color: '#64748b', marginTop: '12px', marginBottom: 0, lineHeight: '1.5' },
  inlineCode: { backgroundColor: '#0f172a', padding: '2px 8px', borderRadius: '4px', color: '#38bdf8', fontSize: '11px', border: '1px solid #1e293b', fontFamily: 'ui-monospace, monospace' },
  provisionSection: { backgroundColor: '#0b1120', border: '1px solid #1e293b', borderRadius: '8px', padding: '24px' },
  provisionTitle: { color: '#fbbf24', fontSize: '16px', fontWeight: '800', margin: 0 },
  provisionSubtitle: { color: '#64748b', fontSize: '12.5px', margin: '6px 0 20px 0' },
  proposalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  proposalCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  proposalHeader: { display: 'flex', justifycontent: 'space-between', alignItems: 'center' },
  proposalIdTag: { fontSize: '10px', fontWeight: '800', backgroundColor: '#3b82f6', padding: '3px 6px', borderRadius: '4px', color: '#ffffff' },
  fxTag: { fontSize: '11px', fontWeight: '700', color: '#10b981', fontFamily: 'ui-monospace, monospace' },
  buyerLabel: { fontSize: '14px', fontWeight: '800', color: '#ffffff' },
  commodityDetail: { fontSize: '12px', color: '#64748b' },
  priceDataRow: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '4px', padding: '12px' },
  priceSubhead: { fontSize: '9px', color: '#475569', fontWeight: '800' },
  priceValueText: { fontSize: '13.5px', fontWeight: '800', color: '#fbbf24', fontFamily: 'ui-monospace, monospace' },
  lockBtn: { backgroundColor: '#ffffff', color: '#05080f', border: '1px solid #ffffff', padding: '12px 16px', borderRadius: '4px', fontSize: '11.5px', fontWeight: '800', width: '100%', textTransform: 'uppercase' },
  wideMetricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', width: '100%' },
  metricCard: { backgroundColor: '#0b1120', border: '1px solid #1e293b', borderRadius: '6px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease' },
  cardIcon: { fontSize: '24px', marginBottom: '12px' },
  cardHeader: { fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' },
  stat: { fontSize: '22px', fontWeight: '900', color: '#ffffff', fontFamily: 'ui-monospace, monospace' },
  statSub: { fontSize: '13px', color: '#10b981', marginTop: '4px', fontWeight: '700', fontFamily: 'ui-monospace, monospace' },
  securedStatus: { fontSize: '10px', fontWeight: '800', marginTop: '8px', color: '#fbbf24' },
  cardBody: { fontSize: '12.5px', color: '#475569', marginTop: '12px', lineHeight: '1.5' },
  tablePanelLarge: { backgroundColor: '#0b1120', border: '1px solid #1e293b', borderRadius: '6px', padding: '24px' },
  panelTitle: { margin: '0 0 20px 0', fontSize: '15px', fontWeight: '900', color: '#ffffff' },
  pseudoTableContainer: { display: 'flex', flexDirection: 'column' },
  tableHeaderRow: { display: 'flex', padding: '12px 20px', backgroundColor: '#070a13', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', border: '1px solid #1e293b' },
  tableDataRow: { display: 'flex', padding: '16px 20px', borderBottom: '1px solid #1e293b', fontSize: '13px', alignItems: 'center' },
  splitContentTableSection: { width: '100%', display: 'flex', flexDirection: 'column' },

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