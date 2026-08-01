import React, { useState } from 'react';

export default function AboutCompanyNode({ onNavigateToRegister }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  return (
    <div style={styles.containerWrap}>
      {/* Company Header Banner */}
      <div style={styles.heroSection}>
        <span style={styles.pillBadge}>✦ VERIFIED B2B ENTERPRISE NODE</span>
        <h1 style={styles.heroTitle}>AMAMA GLOBAL TRADE PVT. LTD.</h1>
        <p style={styles.heroSubtitle}>
          A licensed international trading & logistics conglomerate specializing in cross-border commodity settlement, multi-sig escrow, and automated supply chain clearing.
        </p>

        {/* Quick Stat Badges */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>$1.2B+</span>
            <span style={styles.statLabel}>Annual Volume</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>48+</span>
            <span style={styles.statLabel}>Global Trade Routes</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>0.42s</span>
            <span style={styles.statLabel}>Escrow Lock Latency</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>100%</span>
            <span style={styles.statLabel}>RBI & DGFT Compliant</span>
          </div>
        </div>

        <button 
          onClick={onNavigateToRegister} 
          onMouseEnter={() => setIsCtaHovered(true)}
          onMouseLeave={() => setIsCtaHovered(false)}
          style={{
            ...styles.ctaButton,
            transform: isCtaHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
            boxShadow: isCtaHovered 
              ? '0 6px 25px rgba(236, 72, 153, 0.75)' 
              : '0 4px 20px rgba(236, 72, 153, 0.5)'
          }}
        >
          Initialize Node Registration ➔
        </button>
      </div>

      {/* Navigation Tabs for Company Details */}
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === 'overview' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('overview')}
        >
          Corporate Profile
        </button>
        <button 
          style={activeTab === 'sectors' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('sectors')}
        >
          Trading Sectors
        </button>
        <button 
          style={activeTab === 'compliance' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('compliance')}
        >
          Regulatory & Licenses
        </button>
        <button 
          style={activeTab === 'network' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('network')}
        >
          Global Infrastructure
        </button>
      </div>

      {/* Tab Content 1: Corporate Profile */}
      {activeTab === 'overview' && (
        <div style={styles.detailCard}>
          <h3 style={styles.cardHeader}>🏢 Corporate Overview & Entity Info</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <span style={styles.infoLabel}>Legal Entity Name</span>
              <span style={styles.infoValue}>Amama Global Trade Private Limited</span>
            </div>
            <div style={styles.infoBox}>
              <span style={styles.infoLabel}>Incorporation Year</span>
              <span style={styles.infoValue}>2014 (12+ Years Operating)</span>
            </div>
            <div style={styles.infoBox}>
              <span style={styles.infoLabel}>Global Headquarters</span>
              <span style={styles.infoValue}>Dubai, UAE & Maharashtra, India</span>
            </div>
            <div style={styles.infoBox}>
              <span style={styles.infoLabel}>Primary Business Class</span>
              <span style={styles.infoValue}>Commodities & FinTech Infrastructure</span>
            </div>
          </div>
          <p style={styles.bodyParagraph}>
            Amama Global Trade serves as an integrated B2B liquidity and settlement pipeline connecting agricultural producers, manufacturing industrial clusters, and global enterprise buyers. By leveraging automated multi-sig smart escrow and direct banking API handshakes, Amama removes clearing friction, forex slippage, and counterparty default risks.
          </p>
        </div>
      )}

      {/* Tab Content 2: Trading Sectors */}
      {activeTab === 'sectors' && (
        <div style={styles.gridSection}>
          <div style={styles.featureCard}>
            <span style={styles.cardIcon}>🌾</span>
            <h3 style={styles.cardTitle}>Agro & Bulk Commodities</h3>
            <p style={styles.cardText}>
              Direct farm-to-port sourcing of high-grade cashews, spices, sun-dried raisins, dry fruits, and essential grain crops across Asia and Africa.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.cardIcon}>⚙️</span>
            <h3 style={styles.cardTitle}>Industrial Materials & Scrap</h3>
            <p style={styles.cardText}>
              Non-ferrous & ferrous metals recycling, specialty chemical coatings, aluminium extrusions, and industrial polymer export lines.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.cardIcon}>📦</span>
            <h3 style={styles.cardTitle}>Freight Forwarding & Storage</h3>
            <p style={styles.cardText}>
              Temperature-controlled warehousing, ocean freight chartering, automated customs declaration, and real-time container tracking.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content 3: Regulatory & Compliance */}
      {activeTab === 'compliance' && (
        <div style={styles.detailCard}>
          <h3 style={styles.cardHeader}>📜 Government Approvals & Licenses</h3>
          <div style={styles.complianceList}>
            <div style={styles.complianceItem}>
              <div style={styles.complianceBadge}>VERIFIED</div>
              <div>
                <strong>IEC (Import Export Code):</strong> Registered with DGFT for multi-category international trade.
              </div>
            </div>
            <div style={styles.complianceItem}>
              <div style={styles.complianceBadge}>VERIFIED</div>
              <div>
                <strong>RBI Authorized Dealer (AD Category-1):</strong> Direct integration for automated outward/inward forex remittances.
              </div>
            </div>
            <div style={styles.complianceItem}>
              <div style={styles.complianceBadge}>VERIFIED</div>
              <div>
                <strong>FSSAI & Spice Board Certification:</strong> Full compliance for food-grade commodity export and safety standards.
              </div>
            </div>
            <div style={styles.complianceItem}>
              <div style={styles.complianceBadge}>VERIFIED</div>
              <div>
                <strong>ISO 9001:2015 Quality Management:</strong> Accredited global supply chain and cargo verification protocols.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Global Infrastructure & Corridors */}
      {activeTab === 'network' && (
        <div style={styles.workflowPanel}>
          <h3 style={styles.workflowTitle}>🌐 Operating Corridors & Ports</h3>
          <div style={styles.flowWrapper}>
            <div style={styles.flowNode}>
              <div style={{...styles.nodeBadge, backgroundColor: '#fbbf24'}}>SOUTH ASIA HUB</div>
              <h4 style={styles.nodeTitle}>Nhava Sheva & Mundra Ports</h4>
              <p style={styles.nodeText}>Primary sourcing nodes for agricultural commodities, dry fruits, and bulk industrial metals.</p>
            </div>
            <div style={styles.flowConnector}>➔</div>
            <div style={styles.flowNode}>
              <div style={{...styles.nodeBadge, backgroundColor: '#ec4899'}}>MIDDLE EAST HUB</div>
              <h4 style={styles.nodeTitle}>Jebel Ali (JAFZA) Dubai</h4>
              <p style={styles.nodeText}>Financial settlement clearing house, forex hedging desk, and multi-sig escrow validation servers.</p>
            </div>
            <div style={styles.flowConnector}>➔</div>
            <div style={styles.flowNode}>
              <div style={{...styles.nodeBadge, backgroundColor: '#38bdf8'}}>WESTERN CORRIDOR</div>
              <h4 style={styles.nodeTitle}>EU & US Buyer Nodes</h4>
              <p style={styles.nodeText}>Direct wholesale delivery networks for enterprise buyers and modern retail chains.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Theme
const styles = {
  containerWrap: {
    flex: 1,
    width: '100%',
    padding: '50px 30px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  heroSection: {
    textAlign: 'center',
    maxWidth: '900px',
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
    fontSize: '42px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '10px 0 0 0',
    letterSpacing: '-0.5px',
    textShadow: '0 4px 20px rgba(37, 99, 235, 0.6)'
  },
  heroSubtitle: {
    fontSize: '15px',
    color: '#93c5fd',
    lineHeight: '1.6',
    margin: '0 0 10px 0'
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '16px 28px',
    borderRadius: '12px',
    width: '100%',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
    margin: '10px 0 10px 0'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statValue: {
    color: '#4ade80',
    fontSize: '20px',
    fontWeight: '900'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '600'
  },
  statDivider: {
    width: '1px',
    height: '28px',
    backgroundColor: '#334155'
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
    transition: 'all 0.25s ease'
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    flexWrap: 'wrap'
  },
  tab: {
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: '#2563eb',
    border: '1px solid #3b82f6',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)'
  },
  detailCard: {
    backgroundColor: '#1e293b',
    border: '2px solid #3b82f6',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  cardHeader: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '800',
    margin: '0 0 20px 0'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  infoBox: {
    backgroundColor: '#0f172a',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  infoLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    marginBottom: '4px'
  },
  infoValue: {
    fontSize: '13px',
    color: '#ffffff',
    fontWeight: '700'
  },
  bodyParagraph: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0
  },
  gridSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  featureCard: {
    backgroundColor: '#1e293b',
    border: '2px solid #3b82f6',
    borderRadius: '16px',
    padding: '24px'
  },
  cardIcon: {
    fontSize: '30px',
    display: 'block',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px 0'
  },
  cardText: {
    fontSize: '13px',
    color: '#93c5fd',
    lineHeight: '1.5',
    margin: 0
  },
  complianceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    color: '#cbd5e1',
    fontSize: '14px'
  },
  complianceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#0f172a',
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  complianceBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '900',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  workflowPanel: {
    backgroundColor: '#0f172a',
    border: '2px solid #2563eb',
    borderRadius: '20px',
    padding: '36px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  workflowTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    margin: '0 0 30px 0'
  },
  flowWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  flowNode: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '18px',
    flex: '1',
    minWidth: '220px',
    boxSizing: 'border-box'
  },
  nodeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: '10px'
  },
  nodeTitle: {
    fontSize: '14px',
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
    fontSize: '22px',
    color: '#38bdf8',
    fontWeight: '900',
    userSelect: 'none',
    textAlign: 'center'
  }
};