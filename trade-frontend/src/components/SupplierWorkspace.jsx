import React, { useState } from 'react';

const INITIAL_SUPPLIER_DOCS = [
  {
    id: 'sdoc-1',
    title: 'Phytosanitary & Agricultural Export License',
    status: 'Verified On-Chain',
    statusColor: '#10b981',
    date: 'Jul 10, 2026',
    icon: '🌱',
    hash: '0x9a2f...1102',
    issuer: 'Canadian Food Inspection Agency (CFIA)'
  },
  {
    id: 'sdoc-2',
    title: 'SGS Batch Quality & Purity Certificate',
    status: 'Verified On-Chain',
    statusColor: '#10b981',
    date: 'Jul 14, 2026',
    icon: '🔬',
    hash: '0x4c88...9931',
    issuer: 'SGS International Testing'
  },
  {
    id: 'sdoc-3',
    title: 'Origin Warehouse Storage Manifest',
    status: 'Approved',
    statusColor: '#10b981',
    date: 'Jul 18, 2026',
    icon: '🏬',
    hash: '0x1b22...8840',
    issuer: 'Saskatchewan Grain Hub'
  },
  {
    id: 'sdoc-4',
    title: 'Cross-Corridor Trade Accreditation',
    status: 'Passed',
    statusColor: '#10b981',
    date: 'Jul 25, 2026',
    icon: '🛡️',
    hash: '0x8e55...3301',
    issuer: 'Global AgTrade Node'
  }
];

const ACTIVE_BUYER_LEADS = [
  {
    id: 'buyer-201',
    name: 'Al-Khaleej Grain Imports',
    location: 'Dubai, UAE',
    request: 'Hard Red Winter Wheat (Grade A)',
    quantity: '100 Metric Tons',
    offeredPrice: '$315 / Metric Ton',
    rating: '5.0 ★',
    online: true,
    avatar: '🏙️',
    status: 'PO Issued'
  },
  {
    id: 'buyer-202',
    name: 'North Africa Flour Mills',
    location: 'Alexandria, Egypt',
    request: 'Durum Milling Wheat',
    quantity: '250 Metric Tons',
    offeredPrice: '$305 / Metric Ton',
    rating: '4.8 ★',
    online: true,
    avatar: '🏭',
    status: 'Bidding Active'
  },
  {
    id: 'buyer-203',
    name: 'Singapore Food Trading Hub',
    location: 'Jurong, Singapore',
    request: 'Organic Milling Wheat',
    quantity: '80 Metric Tons',
    offeredPrice: '$325 / Metric Ton',
    rating: '4.9 ★',
    online: false,
    avatar: '🦁',
    status: 'Terms Pending'
  }
];

const SUPPLIER_LOGISTICS_STEPS = [
  { id: 1, title: 'Order Confirmed', tag: 'Buyer & Seller', tagBg: '#f1f5f9', textColor: '#475569', desc: 'Escrow locked by buyer ($12,400). · Jul 18', icon: '📝', status: 'completed' },
  { id: 2, title: 'Harvest & Quality Prep', tag: 'Farm Node', tagBg: '#ffedd5', textColor: '#c2410c', desc: '40T Wheat dispatched to grading lab. · Jul 19', icon: '🌾', status: 'completed' },
  { id: 3, title: 'Inland Trucking Dispatch', tag: 'Logistics', tagBg: '#dbeafe', textColor: '#1d4ed8', desc: 'Loaded into grain hoppers for port transport. · Jul 20', icon: '🚚', status: 'completed' },
  { id: 4, title: 'Port Staging & Weighbridge', tag: 'Terminal', tagBg: '#e0e7ff', textColor: '#4338ca', desc: 'Weighbridge total verified on-chain. · Jul 21', icon: '⚖️', status: 'completed' },
  { id: 5, title: 'Phytosanitary Clearance', tag: 'Customs Node', tagBg: '#fef3c7', textColor: '#b45309', desc: 'Phytosanitary seal attached by authorities. · Jul 22', icon: '📋', status: 'completed' },
  { id: 6, title: 'Container Loading (Vessel)', tag: 'Freight Port', tagBg: '#e0f2fe', textColor: '#0369a1', desc: 'Loaded onto vessel CMA CGM. · Jul 23', icon: '⚓', status: 'completed' },
  { id: 7, title: 'Cross-Corridor Maritime Transit', tag: 'Shipping Line', tagBg: '#dbeafe', textColor: '#1e40af', desc: 'Vessel in ocean corridor. Satellite telemetry streaming. · Jul 25', icon: '🚢', status: 'active' },
  { id: 8, title: 'Import Inspection & Arrival', tag: 'Destination Port', tagBg: '#fef3c7', textColor: '#b45309', desc: 'Awaiting clearance at Abu Dhabi Port. · Scheduled Jul 28', icon: '🛂', status: 'upcoming' },
  { id: 9, title: 'Fulfillment Delivery', tag: 'Buyer Warehouse', tagBg: '#dbeafe', textColor: '#1d4ed8', desc: 'Final offloading and buyer inspection. · Scheduled Jul 30', icon: '🚛', status: 'upcoming' },
  { id: 10, title: 'Escrow Release & Payout', tag: 'Smart Contract', tagBg: '#dcfce7', textColor: '#15803d', desc: 'Automatic payout to Prairie Co-op balance.', icon: '💰', status: 'upcoming' }
];

export default function SupplierWorkspace({ user }) {
  const [activeTab, setActiveTab] = useState('kyc');
  const [isSupplierVerified, setIsSupplierVerified] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentState, setPaymentState] = useState('idle');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Negotiation & Listing States
  const [activeContactBuyer, setActiveContactBuyer] = useState(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [lockedContractPrice, setLockedContractPrice] = useState('$310 / Metric Ton ($12,400 Total - 40T Grade A Wheat)');
  const [searchBuyer, setSearchBuyer] = useState('');

  // Dispatch & Logistics Updates
  const [selectedOrder, setSelectedOrder] = useState('ORD-5510');
  const [dispatchAlerts, setDispatchAlerts] = useState([
    { id: 'a-1', text: 'Maritime corridor bottleneck: Vessel updated route via Gulf of Aden.', status: 'Monitored', priority: 'Medium' }
  ]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [newDispatchNote, setNewDispatchNote] = useState('');

  // Fields
  const [supplierOrg, setSupplierOrg] = useState(user?.companyName || 'Prairie Co-op Agriculture Inc.');
  const [exportLicenseId, setExportLicenseId] = useState(user?.licenseId || 'CA-AGRI-99812-X');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleRazorpayVerification = (e) => {
    e.preventDefault();
    setPaymentState('processing');
    setTimeout(() => setPaymentState('success'), 2800);
    setTimeout(() => {
      setIsSupplierVerified(true);
      setShowRazorpayModal(false);
      setPaymentState('idle');
      triggerToast('🎉 Supplier Verification Approved! Order Dispatch & Multi-Buyer Marketplace Unlocked.');
    }, 4200);
  };

  const handleSendProposal = (e) => {
    e.preventDefault();
    if (!proposalMessage.trim()) return;
    triggerToast(`🚀 Price counter-proposal dispatched to ${activeContactBuyer.name}!`);
    setActiveContactBuyer(null);
    setProposalMessage('');
  };

  const handleAddDispatchNote = (e) => {
    e.preventDefault();
    if (!newDispatchNote.trim()) return;
    setDispatchAlerts([{ id: `a-${Date.now()}`, text: newDispatchNote, status: 'Logged', priority: 'High' }, ...dispatchAlerts]);
    setNewDispatchNote('');
    setShowDispatchModal(false);
    triggerToast('⚡ Live logistics update broadcasted to Buyer & Escrow Contract.');
  };

  const filteredBuyers = ACTIVE_BUYER_LEADS.filter(b => 
    b.name.toLowerCase().includes(searchBuyer.toLowerCase()) || 
    b.request.toLowerCase().includes(searchBuyer.toLowerCase())
  );

  return (
    <div style={styles.appContainer}>
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes greenPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes floatEffect {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        .animated-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .animated-card:hover { transform: translateY(-3px) scale(1.005); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12); }
        .interactive-btn { transition: all 0.2s ease; cursor: pointer; }
        .interactive-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .interactive-btn:active { transform: translateY(1px); }
      `}</style>

      {/* Dynamic Animated Toast Banner */}
      {toastMessage && (
        <div style={styles.toastBanner}>
          <span style={styles.toastPulseDot}></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* GRADIENT TOP HEADER */}
      <header style={styles.topHeader}>
        <div style={styles.brandGroup} className="interactive-btn" onClick={() => triggerToast('Supplier Node #88: Prairie Co-op Active')}>
          <div style={styles.brandIcon}>🌾</div>
          <div>
            <div style={styles.brandTitle}>AMAMA GLOBAL TRADE</div>
            <div style={styles.brandSub}>● Autonomous Supplier &amp; Origin Dispatch Terminal</div>
          </div>
        </div>

        <div style={styles.topHeaderRight}>
          <div style={styles.liveTradePill}>
            <span style={styles.greenRadarDot}></span>
            <span>Payout Escrow Network: <strong>Active</strong></span>
          </div>

          <div style={styles.userBadge} className="interactive-btn" onClick={() => triggerToast(`Authenticated Node: ${user?.email || 'Supplier Controller'}`)}>
            <div style={styles.userAvatar}>🏭</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800' }}>{user?.email || 'Supplier Controller'}</div>
              <span style={styles.roleTag}>{user?.role || 'VERIFIED SUPPLIER NODE'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY LAYOUT */}
      <div style={styles.bodyLayout}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={styles.sidebar}>
          <div style={styles.terminalHeader}>
            <div style={styles.terminalIcon}>⚡</div>
            <div>
              <div style={styles.terminalTitle}>SUPPLIER COMMAND</div>
              <div style={styles.terminalSub}>Export &amp; Logistics Hub</div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <button
              style={{
                ...styles.navItem,
                background: activeTab === 'kyc' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: activeTab === 'kyc' ? '#ffffff' : '#64748b',
                boxShadow: activeTab === 'kyc' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
              className="interactive-btn"
              onClick={() => { setActiveTab('kyc'); triggerToast('Switched to Origin Accreditation & Vetting'); }}
            >
              <span>📜</span> 1. Accreditation &amp; Vault
            </button>

            {isSupplierVerified && (
              <button
                style={{
                  ...styles.navItem,
                  background: activeTab === 'dispatch' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                  color: activeTab === 'dispatch' ? '#ffffff' : '#64748b',
                  boxShadow: activeTab === 'dispatch' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                }}
                className="interactive-btn"
                onClick={() => { setActiveTab('dispatch'); triggerToast('Switched to Dispatch Telemetry & Orders'); }}
              >
                <span>🚢</span> 2. Orders &amp; Buyer Offers
              </button>
            )}
          </nav>

          {/* SIDEBAR METRICS COUNTER */}
          <div style={styles.sidebarMetricsWidget}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800' }}>PENDING ESCROW PAYOUTS</div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981', marginTop: '2px' }}>$348,200</div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>🔒 Auto-Release upon Port Clearance</div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={styles.mainContent}>
          
          {/* KPI METRIC CARDS HEADER ROW */}
          <div style={styles.kpiRow}>
            <div style={styles.kpiCard} className="animated-card">
              <div style={{ fontSize: '20px' }}>💰</div>
              <div>
                <div style={styles.kpiLabel}>LOCKED ORDER VALUE</div>
                <div style={styles.kpiValue}>$12,400 (40T Wheat)</div>
              </div>
            </div>

            <div style={styles.kpiCard} className="animated-card">
              <div style={{ fontSize: '20px' }}>🚢</div>
              <div>
                <div style={styles.kpiLabel}>DISPATCH STATUS</div>
                <div style={{ ...styles.kpiValue, color: '#2563eb' }}>Maritime In-Transit</div>
              </div>
            </div>

            <div style={styles.kpiCard} className="animated-card">
              <div style={{ fontSize: '20px' }}>🤝</div>
              <div>
                <div style={styles.kpiLabel}>ACTIVE BUYER OFFERS</div>
                <div style={styles.kpiValue}>3 Verified Buyers</div>
              </div>
            </div>

            <div style={styles.kpiCard} className="animated-card">
              <div style={{ fontSize: '20px' }}>🛡️</div>
              <div>
                <div style={styles.kpiLabel}>ACCREDITATION</div>
                <div style={{ ...styles.kpiValue, color: isSupplierVerified ? '#10b981' : '#f59e0b' }}>
                  {isSupplierVerified ? 'PASSED ✓' : 'ACTION REQUIRED'}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: ACCREDITATION & CERTIFICATES */}
          {activeTab === 'kyc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={styles.cardContainer} className="animated-card">
                <div style={styles.cardHeaderRow}>
                  <div>
                    <h2 style={styles.cardSectionTitle}>📜 Supplier Compliance &amp; Quality Vault</h2>
                    <p style={styles.cardSubtext}>Phytosanitary clearances, export licenses, and laboratory purity certificates.</p>
                  </div>

                  <span 
                    style={{
                      ...styles.statusPill,
                      background: isSupplierVerified ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
                      color: '#ffffff'
                    }}
                    className="interactive-btn"
                    onClick={() => triggerToast(isSupplierVerified ? 'Status: Fully Accredited' : 'Action Required: Pay $250 registration fee')}
                  >
                    {isSupplierVerified ? '✓ APPROVED SUPPLIER' : '⚠️ VETTING PENDING'}
                  </span>
                </div>

                <div style={styles.fieldsGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.fieldLabel}>EXPORTER ORGANISATION NAME</label>
                    <input 
                      type="text" 
                      value={supplierOrg} 
                      onChange={(e) => setSupplierOrg(e.target.value)}
                      style={styles.styledInput} 
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.fieldLabel}>EXPORT / AGRICULTURAL LICENSE ID</label>
                    <input 
                      type="text" 
                      value={exportLicenseId} 
                      onChange={(e) => setExportLicenseId(e.target.value)}
                      style={styles.styledInput} 
                    />
                  </div>
                </div>

                {/* VERIFIED DOCUMENTS */}
                <div style={{ marginTop: '24px' }}>
                  <div style={styles.docGridHeader}>ORIGIN CERTIFICATES &amp; AUDIT TRAILS (INSPECT PROOF)</div>
                  
                  <div style={styles.docGrid}>
                    {INITIAL_SUPPLIER_DOCS.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          ...styles.docCard,
                          borderColor: selectedDoc?.id === doc.id ? '#2563eb' : '#e2e8f0',
                          backgroundColor: selectedDoc?.id === doc.id ? '#eff6ff' : '#ffffff'
                        }}
                        className="interactive-btn animated-card"
                        onClick={() => {
                          setSelectedDoc(doc);
                          triggerToast(`Inspecting Document Hash: ${doc.hash}`);
                        }}
                      >
                        <span style={{ fontSize: '26px' }}>{doc.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.docTitle}>{doc.title}</div>
                          <div style={{ ...styles.docStatus, color: doc.statusColor }}>
                            ● {doc.status}
                          </div>
                          <div style={styles.docDate}>Logged: {doc.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DOCUMENT INSPECTOR DRAWER */}
                {selectedDoc && (
                  <div style={styles.docDrawer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#1e293b', fontWeight: '800' }}>
                        🔗 Cryptographic Origin Proof: {selectedDoc.title}
                      </h4>
                      <button style={styles.closeDrawerBtn} onClick={() => setSelectedDoc(null)}>✕ Close</button>
                    </div>
                    <div style={styles.drawerDetailsGrid}>
                      <div><strong>Tx Hash:</strong> <code style={{ color: '#2563eb' }}>{selectedDoc.hash}</code></div>
                      <div><strong>Authority Issuer:</strong> {selectedDoc.issuer}</div>
                      <div><strong>Audit Date:</strong> {selectedDoc.date}</div>
                      <div><strong>Escrow Status:</strong> <span style={{ color: '#10b981', fontWeight: '800' }}>VERIFIED</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT UNLOCK CALL TO ACTION */}
              {!isSupplierVerified ? (
                <div style={styles.paymentSectionContainer} className="animated-card">
                  <div style={styles.paymentBannerGradient}>
                    <div>
                      <span style={styles.payTag}>SUPPLIER NODE ACCREDITATION</span>
                      <h3 style={styles.payTitle}>
                        Pay $250 USD to Unlock Order Dispatch Controls &amp; Buyer Counter-Bidding
                      </h3>
                      <p style={styles.paySub}>
                        Accreditation confirms farm/origin legitimacy, enabling direct contract signing, weighbridge telematics, and automated escrow payouts.
                      </p>
                    </div>

                    <button 
                      style={styles.payActionBtn} 
                      className="interactive-btn"
                      onClick={() => setShowRazorpayModal(true)}
                    >
                      Pay $250 via Razorpay 🪙
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.unlockedCard} className="interactive-btn animated-card" onClick={() => setActiveTab('dispatch')}>
                  <span style={{ fontSize: '32px' }}>✨</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#065f46', fontWeight: '900' }}>Supplier Node Fully Accredited</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#047857' }}>
                      Click here to jump straight to Active Order Controls &amp; Buyer Offers Hub.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DISPATCH CONTROLS & BUYER OFFERS */}
          {activeTab === 'dispatch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* CONTRACT ESCROW LOCK BANNER */}
              <div style={styles.dealLockBanner} className="animated-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={styles.dealLockTag}>🔒 ACTIVE ESCROW CONTRACT — FUNDS LOCKED BY BUYER</div>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                      Locked Order Terms: <span style={{ color: '#10b981' }}>{lockedContractPrice}</span>
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>
                      Payout auto-triggers upon buyer port clearance and receipt sign-off.
                    </p>
                  </div>
                  <button 
                    style={styles.renegotiateBtn}
                    className="interactive-btn"
                    onClick={() => triggerToast('Update requested for contract payment terms...')}
                  >
                    Adjust Terms 💬
                  </button>
                </div>
              </div>

              {/* BUYER INQUIRIES & LEADS DIRECTORY */}
              <div style={styles.cardContainer} className="animated-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={styles.cardSectionTitle}>🏢 Buyer Purchase Orders &amp; Counter-Offers</h2>
                    <p style={styles.cardSubtext}>Directly respond to verified buyer purchasing requests and lock prices.</p>
                  </div>

                  <input 
                    type="text" 
                    placeholder="🔍 Search buyers or requests..."
                    value={searchBuyer}
                    onChange={(e) => setSearchBuyer(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.sellerGrid}>
                  {filteredBuyers.map((buyer) => (
                    <div key={buyer.id} style={styles.sellerCard} className="animated-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '32px' }}>{buyer.avatar}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{buyer.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {buyer.location}</div>
                          </div>
                        </div>
                        <span style={styles.sellerBadge}>{buyer.status}</span>
                      </div>

                      <div style={styles.sellerDetailsBox}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{buyer.request}</div>
                        <div style={{ fontSize: '13px', color: '#059669', fontWeight: '900', marginTop: '4px' }}>
                          Offered Rate: {buyer.offeredPrice}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                          <span>Volume: <strong>{buyer.quantity}</strong></span>
                          <span>Rating: <strong style={{ color: '#f59e0b' }}>{buyer.rating}</strong></span>
                        </div>
                      </div>

                      <button 
                        style={styles.contactSellerBtn}
                        className="interactive-btn"
                        onClick={() => setActiveContactBuyer(buyer)}
                      >
                        Submit Counter-Proposal 💬
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE SHIPMENT DISPATCH TELEMETRY */}
              <div style={styles.trackingCard} className="animated-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>🚚 Cargo Dispatch Telemetry &amp; Waybill</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      Monitor outgoing consignments and post real-time waybill status updates to the buyer.
                    </p>
                  </div>

                  <select 
                    value={selectedOrder} 
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    style={styles.orderSelect}
                  >
                    <option value="ORD-5510">ORD-5510 — Al-Khaleej Imports · Wheat, 40t</option>
                    <option value="ORD-3301">ORD-3301 — North Africa Mills · Durum, 100t</option>
                  </select>
                </div>

                {/* ACTIVE DISPATCH STATUS BANNER */}
                <div style={styles.activeStatusBanner}>
                  <div style={styles.livePulseDot}></div>
                  <span style={{ fontWeight: '800', color: '#1e40af' }}>SHIPMENT CORRIDOR:</span> 
                  <span style={{ fontWeight: '800', color: '#2563eb' }}>
                    Vessel CMA CGM en route to Abu Dhabi Port · GPS Telematics Verified
                  </span>
                </div>

                {/* TIMELINE STEPS */}
                <div style={styles.timelineContainer}>
                  {SUPPLIER_LOGISTICS_STEPS.map((step, index) => {
                    const isLast = index === SUPPLIER_LOGISTICS_STEPS.length - 1;
                    const isActive = step.status === 'active';
                    const isCompleted = step.status === 'completed';

                    return (
                      <div key={step.id} style={styles.timelineRow}>
                        <div style={styles.nodeColumn}>
                          <div 
                            style={{
                              ...styles.nodeCircle,
                              backgroundColor: isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#ffffff',
                              borderColor: isActive ? '#2563eb' : isCompleted ? '#059669' : '#cbd5e1',
                              color: isActive || isCompleted ? '#ffffff' : '#64748b'
                            }}
                          >
                            <span>{step.icon}</span>
                          </div>

                          {!isLast && (
                            <div 
                              style={{
                                ...styles.lineConnector,
                                backgroundColor: isCompleted ? '#10b981' : '#e2e8f0'
                              }}
                            />
                          )}
                        </div>

                        <div style={{ flex: 1, paddingBottom: isLast ? '0' : '18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: isActive ? '#2563eb' : '#0f172a' }}>
                              {step.title}
                            </span>
                            <span style={{ ...styles.roleTag, backgroundColor: step.tagBg, color: step.textColor }}>
                              {step.tag}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                            {step.desc}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    style={styles.raiseConcernBtn} 
                    className="interactive-btn"
                    onClick={() => setShowDispatchModal(true)}
                  >
                    📡 Broadcast Waybill Update
                  </button>

                  <button 
                    style={styles.contactLogisticsBtn} 
                    className="interactive-btn"
                    onClick={() => triggerToast('Pinging Carrier Shipping Line Desk...')}
                  >
                    📞 Call Port Dispatcher
                  </button>
                </div>

              </div>

              {/* DISPATCH ALERTS PANEL */}
              <div style={styles.concernPanel} className="animated-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Origin &amp; Transit Advisories</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{dispatchAlerts.length} logged</span>
                </div>

                {dispatchAlerts.map((item) => (
                  <div key={item.id} style={styles.concernItemBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{item.text}</span>
                    </div>
                    <span style={styles.concernStatusBadge}>{item.status}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* RAZORPAY PAYMENT MODAL */}
      {showRazorpayModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <span style={{ fontWeight: '800', fontSize: '13px' }}>⚡ Razorpay Supplier Vetting</span>
              <button style={styles.modalCloseBtn} onClick={() => setShowRazorpayModal(false)}>✕</button>
            </div>

            {paymentState === 'idle' && (
              <form onSubmit={handleRazorpayVerification} style={{ padding: '20px' }}>
                <div style={styles.modalAmountBox}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>SUPPLIER ACCREDITATION FEE</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>Amama Global Trade Network</div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>$250.00</div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={styles.fieldLabel}>CORPORATE CARD NUMBER</label>
                  <input type="text" defaultValue="4242 •••• •••• 4242" style={styles.styledInput} required />
                </div>

                <button type="submit" style={styles.payNowModalBtn} className="interactive-btn">
                  Pay $250.00 &amp; Activate Exporter Node 🪙
                </button>
              </form>
            )}

            {paymentState === 'processing' && (
              <div style={styles.loadingBox}>
                <div style={{ fontSize: '38px', animation: 'floatEffect 1.2s infinite ease-in-out' }}>🌾</div>
                <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '14px', color: '#1e293b' }}>
                  Authenticating Exporter Credentials...
                </div>
              </div>
            )}

            {paymentState === 'success' && (
              <div style={styles.loadingBox}>
                <span style={{ fontSize: '42px' }}>🎉</span>
                <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '10px', color: '#10b981' }}>
                  Supplier Node Approved!
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROPOSAL POP-UP MODAL */}
      {activeContactBuyer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <span style={{ fontWeight: '800', fontSize: '13px' }}>
                💬 Counter-Proposal: {activeContactBuyer.name}
              </span>
              <button style={styles.modalCloseBtn} onClick={() => setActiveContactBuyer(null)}>✕</button>
            </div>

            <form onSubmit={handleSendProposal} style={{ padding: '20px' }}>
              <div style={styles.sellerModalSummary}>
                <div><strong>Requested:</strong> {activeContactBuyer.request}</div>
                <div><strong>Buyer's Offer:</strong> {activeContactBuyer.offeredPrice}</div>
              </div>

              <label style={styles.fieldLabel}>YOUR COUNTER TERMS OR DELIVERY DATE</label>
              <textarea 
                rows="3" 
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="e.g. Can supply Grade A Wheat at $310/Ton for 100 Tons with expedited dispatch..."
                style={{ ...styles.styledInput, height: '80px', resize: 'none' }}
                required
              />

              <button type="submit" style={styles.payNowModalBtn} className="interactive-btn">
                Send Proposal to Buyer 📩
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH NOTE MODAL */}
      {showDispatchModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <span style={{ fontWeight: '800', fontSize: '13px' }}>📡 Broadcast Dispatch Update ({selectedOrder})</span>
              <button style={styles.modalCloseBtn} onClick={() => setShowDispatchModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddDispatchNote} style={{ padding: '20px' }}>
              <label style={styles.fieldLabel}>WAYBILL / DISPATCH DETAILS</label>
              <textarea 
                rows="3" 
                value={newDispatchNote}
                onChange={(e) => setNewDispatchNote(e.target.value)}
                placeholder="e.g. Hoppers loaded and passed moisture testing (11.2%). Bill of Lading attached..."
                style={{ ...styles.styledInput, height: '80px', resize: 'none' }}
                required
              />

              <button type="submit" style={styles.payNowModalBtn} className="interactive-btn">
                Broadcast Update to Escrow Ledger ⚡
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  appContainer: { width: '100%', minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  toastBanner: { position: 'fixed', top: '16px', right: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#ffffff', padding: '12px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', zIndex: 10000, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px' },
  toastPulseDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'greenPulse 1.5s infinite ease-in-out' },
  
  topHeader: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: { width: '36px', height: '36px', backgroundColor: '#059669', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(5,150,105,0.4)' },
  brandTitle: { fontSize: '14px', fontWeight: '900', letterSpacing: '0.6px' },
  brandSub: { fontSize: '10px', color: '#34d399', fontWeight: '700' },
  topHeaderRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  liveTradePill: { backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' },
  greenRadarDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' },
  userBadge: { backgroundColor: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: { fontSize: '14px' },
  roleTag: { fontSize: '9px', fontWeight: '900', color: '#34d399' },

  bodyLayout: { display: 'flex', minHeight: 'calc(100vh - 64px)' },
  sidebar: { width: '230px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  terminalHeader: { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
  terminalIcon: { backgroundColor: '#059669', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '900' },
  terminalTitle: { fontSize: '11px', fontWeight: '900', color: '#0f172a' },
  terminalSub: { fontSize: '10px', color: '#64748b' },
  sidebarNav: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  navItem: { border: 'none', borderRadius: '8px', padding: '12px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  sidebarMetricsWidget: { padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: 'auto' },

  mainContent: { flex: 1, padding: '24px 32px' },
  
  // KPI ROW
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' },
  kpiCard: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' },
  kpiLabel: { fontSize: '10px', fontWeight: '800', color: '#64748b', letterSpacing: '0.5px' },
  kpiValue: { fontSize: '13px', fontWeight: '900', color: '#0f172a', marginTop: '2px' },

  cardContainer: { backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardSectionTitle: { margin: 0, fontSize: '16px', fontWeight: '900', color: '#0f172a' },
  cardSubtext: { margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' },
  statusPill: { padding: '6px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' },
  
  fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  fieldLabel: { fontSize: '10px', fontWeight: '800', color: '#64748b', marginBottom: '6px' },
  styledInput: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#0f172a', width: '100%', boxSizing: 'border-box' },
  
  docGridHeader: { fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '12px', letterSpacing: '0.5px' },
  docGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' },
  docCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid', borderRadius: '10px' },
  docTitle: { fontSize: '11px', fontWeight: '800', color: '#0f172a' },
  docStatus: { fontSize: '10px', fontWeight: '800', marginTop: '2px' },
  docDate: { fontSize: '9px', color: '#94a3b8', marginTop: '2px' },
  docDrawer: { marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px' },
  closeDrawerBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: '800', cursor: 'pointer' },
  drawerDetailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', fontSize: '11px' },

  paymentSectionContainer: { marginTop: '20px' },
  paymentBannerGradient: { background: 'linear-gradient(135deg, #065f46, #059669)', color: '#ffffff', padding: '24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  payTag: { fontSize: '10px', fontWeight: '900', color: '#a7f3d0', letterSpacing: '0.8px' },
  payTitle: { fontSize: '16px', fontWeight: '900', margin: '6px 0' },
  paySub: { fontSize: '12px', color: '#d1fae5', margin: 0, maxWidth: '540px' },
  payActionBtn: { backgroundColor: '#ffffff', color: '#047857', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  unlockedCard: { marginTop: '20px', padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px' },

  // DEAL LOCK & BUYERS
  dealLockBanner: { padding: '20px 24px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '14px' },
  dealLockTag: { fontSize: '10px', fontWeight: '900', color: '#1d4ed8', letterSpacing: '0.8px' },
  renegotiateBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  searchInput: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', width: '220px' },
  sellerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '12px' },
  sellerCard: { padding: '18px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  sellerBadge: { fontSize: '9px', fontWeight: '900', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' },
  sellerDetailsBox: { marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' },
  contactSellerBtn: { marginTop: '14px', padding: '10px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },

  // TRACKING & TIMELINE
  trackingCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px' },
  orderSelect: { padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '800', color: '#1e293b' },
  activeStatusBanner: { padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' },
  livePulseDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'greenPulse 1.5s infinite ease-in-out' },
  timelineContainer: { marginTop: '24px', paddingLeft: '4px' },
  timelineRow: { display: 'flex', gap: '16px' },
  nodeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px' },
  nodeCircle: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
  lineConnector: { width: '3px', flex: 1, margin: '4px 0' },
  roleTag: { fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' },
  raiseConcernBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  contactLogisticsBtn: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' },
  concernPanel: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px' },
  concernItemBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  concernStatusBadge: { fontSize: '10px', fontWeight: '900', color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '10px' },

  // MODALS
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: '14px', width: '390px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  modalHeader: { backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' },
  modalAmountBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  sellerModalSummary: { padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '11px', border: '1px solid #e2e8f0', marginBottom: '12px' },
  payNowModalBtn: { width: '100%', marginTop: '18px', padding: '12px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '900', cursor: 'pointer' },
  loadingBox: { padding: '40px 20px', textAlign: 'center' }
};