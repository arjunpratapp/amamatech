import React, { useState, useEffect } from 'react';

// --- SEED DATA: TOP 5 SUPPLIERS ---
const TOP_5_SELLERS = [
  {
    id: 'seller-101',
    name: 'Prairie Co-op Agriculture',
    location: 'Saskatchewan, Canada',
    commodity: 'Hard Red Winter Wheat (Grade A)',
    unitPrice: 310,
    moq: 40,
    rating: '4.9 ★',
    avatar: '🌾',
    badge: 'TOP SUPPLIER',
    originPort: 'Vancouver (CAVAN)',
    destPort: 'Rotterdam (NLRTM)'
  },
  {
    id: 'seller-102',
    name: 'Indus Valley Grain Exporters',
    location: 'Punjab, India',
    commodity: 'Basmati Rice (1121 Steam)',
    unitPrice: 850,
    moq: 20,
    rating: '4.8 ★',
    avatar: '🍚',
    badge: 'PREMIUM QUALITY',
    originPort: 'Mundra (INMUN)',
    destPort: 'Jebel Ali (AEJEA)'
  },
  {
    id: 'seller-103',
    name: 'Al-Dahra Food Industries',
    location: 'Abu Dhabi, UAE',
    commodity: 'Organic Yellow Corn',
    unitPrice: 275,
    moq: 100,
    rating: '5.0 ★',
    avatar: '🌽',
    badge: 'LOCAL HUB',
    originPort: 'Khalifa Port (AEKHL)',
    destPort: 'Dammam (SADMM)'
  },
  {
    id: 'seller-104',
    name: 'Sanko Agro Commodities',
    location: 'Sao Paulo, Brazil',
    commodity: 'Soybeans (Grade No. 2)',
    unitPrice: 420,
    moq: 50,
    rating: '4.7 ★',
    avatar: '🌱',
    badge: 'HIGH CAPACITY',
    originPort: 'Santos (BRSSZ)',
    destPort: 'Qingdao (CNTAO)'
  },
  {
    id: 'seller-105',
    name: 'Aethelgard Grain Traders',
    location: 'Odesa, Ukraine',
    commodity: 'Milling Barley',
    unitPrice: 240,
    moq: 60,
    rating: '4.6 ★',
    avatar: '🌾',
    badge: 'FAST DISPATCH',
    originPort: 'Odesa (UAODS)',
    destPort: 'Alexandria (EGALY)'
  }
];

export default function BuyerWorkspaceLiveTrade({ user }) {
  // --- WORKFLOW STEP ---
  // Step 1: KYC Verification (Requires Tax / Incorporation Certificate)
  // Step 2: Browse Top Sellers & RFQ (Requires Purchase Intent Spec Doc)
  // Step 3: Contract & Negotiation (Requires Signed Sales Contract PDF)
  // Step 4: Stripe Escrow Checkout (Requires Escrow Authorization / Wire Form)
  // Step 5: LIVE TRADE DASHBOARD (Requires BL & QC Certificates)
  const [workflowStep, setWorkflowStep] = useState(1);

  // --- STEP DOCUMENTS TRACKER ---
  // Stores verified files for each layer
  const [stepDocuments, setStepDocuments] = useState({
    step1: null, // KYC Document
    step2: null, // RFQ / Purchase Spec
    step3: null, // Signed Contract
    step4: null, // Escrow Authorization
  });

  // --- STEP 1: KYC STATE ---
  const [kycData, setKycData] = useState({
    companyName: 'Global Commodities Buying Corp',
    taxId: 'US-99882211',
    country: 'United States'
  });

  // --- STEP 2 & 3: SELLER & DEAL SELECTION ---
  const [selectedSeller, setSelectedSeller] = useState(TOP_5_SELLERS[0]);
  const [orderQuantity, setOrderQuantity] = useState(40);
  const [negotiatedPrice, setNegotiatedPrice] = useState(TOP_5_SELLERS[0].unitPrice);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDealClosed, setIsDealClosed] = useState(false);

  // --- STEP 4: STRIPE PAYMENT & ANIMATION ---
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success'

  // --- LIVE TRADE SIMULATION STATE ---
  const [liveTradeData, setLiveTradeData] = useState({
    status: 'TRANSIT_IN_PROGRESS',
    vesselName: 'MV OCEAN PHOENIX V-402',
    lat: '24.8607° N',
    lng: '67.0011° E',
    speedKnots: '18.4 kts',
    tempC: '18.5°C',
    humidityPct: '54%',
    etaDays: 6,
    routeProgress: 42,
    containerId: 'CONT-892011-X'
  });

  // Live Audit Feed / Ticker Logs
  const [liveLogs, setLiveLogs] = useState([]);

  // Escrow Tranches
  const [escrowTranches, setEscrowTranches] = useState([
    { id: 1, name: 'Tranche 1: Advance Escrow', percent: 25, status: 'LOCKED', releaseTrigger: 'PO Signing & Lock' },
    { id: 2, name: 'Tranche 2: Pre-Shipment Inspection', percent: 35, status: 'LOCKED', releaseTrigger: 'SGS Quality Approval' },
    { id: 3, name: 'Tranche 3: Port Arrival & BL Discharge', percent: 40, status: 'LOCKED', releaseTrigger: 'Bill of Lading Delivery' }
  ]);

  // Modals & Document Repository
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [docCategory, setDocCategory] = useState('Bill of Lading (BL)');
  const [selectedFile, setSelectedFile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const totalPrice = orderQuantity * negotiatedPrice;

  // --- LIVE TELEMETRY TICKER EFFECT ---
  useEffect(() => {
    if (workflowStep !== 5) return;

    const interval = setInterval(() => {
      setLiveTradeData(prev => ({
        ...prev,
        routeProgress: Math.min(prev.routeProgress + 1, 100),
        tempC: (18 + Math.random() * 0.8).toFixed(1) + '°C',
        humidityPct: Math.floor(52 + Math.random() * 4) + '%'
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [workflowStep]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // --- STEP 1: VERIFY KYC & DOCUMENT UNLOCK ---
  const handleVerifyKYC = (e) => {
    e.preventDefault();
    if (!stepDocuments.step1) {
      triggerToast('❌ BLOCKED: You must attach your Certificate of Incorporation PDF to unlock Step 2.');
      return;
    }
    
    setWorkflowStep(2);
    setLiveLogs(prev => [{ id: Date.now(), time: 'Just now', text: `Step 1 Passed: Uploaded "${stepDocuments.step1.name}"`, type: 'KYC' }, ...prev]);
    triggerToast('✅ Step 1 Verified & Document Attached! Step 2 Unlocked.');
  };

  // --- STEP 2: SELECT SELLER & ATTACH RFQ SPEC SHEET ---
  const handleSelectSeller = (seller) => {
    if (!stepDocuments.step2) {
      triggerToast('❌ BLOCKED: Attach your Purchase Specification Document before unlocking Step 3.');
      return;
    }

    setSelectedSeller(seller);
    setNegotiatedPrice(seller.unitPrice);
    setChatMessages([
      { sender: 'System', text: `RFQ Initiated with ${seller.name} for ${seller.commodity}. Spec doc attached.` },
      { sender: seller.name, text: `Greetings! We reviewed your spec doc. We can ship ${orderQuantity} MT from ${seller.originPort} to ${seller.destPort}.` }
    ]);
    
    setWorkflowStep(3);
    setLiveLogs(prev => [{ id: Date.now(), time: 'Just now', text: `Step 2 Passed: RFQ Spec attached for ${seller.name}`, type: 'RFQ' }, ...prev]);
    triggerToast(`🏢 Connected with ${seller.name}. Step 3 Unlocked!`);
  };

  // --- STEP 3: CHAT & LOCK DEAL CONTRACT ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'You', text: newMessage }]);
    setNewMessage('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: selectedSeller.name, text: `Confirmed! Unit rate fixed at $${negotiatedPrice}/MT for total $${totalPrice.toLocaleString()} USD.` }
      ]);
    }, 1000);
  };

  const handleCloseDeal = () => {
    if (!stepDocuments.step3) {
      triggerToast('❌ BLOCKED: Attach the Signed Bilateral Contract PDF to unlock Stripe Escrow.');
      return;
    }
    setIsDealClosed(true);
    triggerToast('🤝 Terms & Contract Attached! Step 4 Unlocked. Open Stripe Checkout.');
  };

  // --- STEP 4: STRIPE PAYMENT EXECUTION ---
  const handleExecutePayment = () => {
    if (!stepDocuments.step4) {
      triggerToast('❌ BLOCKED: Attach Escrow Authorization Form before releasing payment.');
      return;
    }

    setPaymentStatus('processing');

    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        setShowStripeModal(false);
        setEscrowTranches(prev => prev.map(t => t.id === 1 ? { ...t, status: 'RELEASED' } : t));
        setWorkflowStep(5);
        
        setLiveLogs(prev => [
          { id: Date.now(), time: 'Just now', text: `LIVE TRADE UNLOCKED: $${(totalPrice * 0.25).toLocaleString()} deposited to Escrow. All initial documents verified.`, type: 'FINANCE' },
          ...prev
        ]);

        triggerToast('⚡ ALL STAGES UNLOCKED! Real-Time Live Trade Monitoring Active.');
      }, 1600);
    }, 2200);
  };

  // --- STEP 5: WORKFLOW ACTIONS ---
  const handleApproveQC = () => {
    const hasQCDoc = uploadedDocs.some(d => d.type === 'QC Inspection Report');
    if (!hasQCDoc) {
      triggerToast('❌ BLOCKED: Upload an official SGS / Bureau Veritas QC Inspection Report first!');
      setShowUploadModal(true);
      return;
    }

    setEscrowTranches(prev => prev.map(t => t.id === 2 ? { ...t, status: 'RELEASED' } : t));
    setLiveLogs(prev => [
      { id: Date.now(), time: 'Just now', text: 'QC Report Verified. Tranche 2 (35%) Released to Exporter.', type: 'QUALITY' },
      ...prev
    ]);
    triggerToast('🔍 QC Cleared & Verified! Tranche 2 Escrow Released.');
  };

  const handleReleaseFinal = () => {
    const hasBLDoc = uploadedDocs.some(d => d.type === 'Bill of Lading (BL)');
    if (!hasBLDoc) {
      triggerToast('❌ BLOCKED: Upload Original Bill of Lading (BL) document before final settlement!');
      setShowUploadModal(true);
      return;
    }

    setEscrowTranches(prev => prev.map(t => ({ ...t, status: 'RELEASED' })));
    setLiveTradeData(prev => ({ ...prev, routeProgress: 100, status: 'DELIVERED_COMPLETED' }));
    setLiveLogs(prev => [
      { id: Date.now(), time: 'Just now', text: 'Bill of Lading Confirmed. 100% Final Settlement Dispatched!', type: 'SUCCESS' },
      ...prev
    ]);
    triggerToast('🎉 Trade Successfully Completed & Full Escrow Settled!');
  };

  // Generic Helper to handle File Selection for Specific Steps
  const handleStepDocAttach = (stepKey, file) => {
    if (!file) return;
    const docObj = { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleTimeString() };
    
    setStepDocuments(prev => ({ ...prev, [stepKey]: docObj }));
    setUploadedDocs(prev => [{ id: `doc-${Date.now()}`, name: file.name, type: `Step ${stepKey.replace('step', '')} Document`, time: 'Just now' }, ...prev]);
    
    triggerToast(`📎 Document "${file.name}" attached for ${stepKey.toUpperCase()}! Unlock requirements met.`);
  };

  return (
    <div style={styles.appContainer}>
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .interactive-btn { transition: all 0.2s ease; cursor: pointer; }
        .interactive-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .interactive-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: grayscale(0.8); }
        .live-pulse-dot { width: 10px; height: 10px; background-color: #10b981; border-radius: 50%; animation: pulseGlow 1.8s infinite; }
      `}</style>

      {/* TOAST BANNER */}
      {toastMessage && (
        <div style={{
          ...styles.toastBanner,
          backgroundColor: toastMessage.includes('❌') ? '#991b1b' : '#0f172a'
        }}>
          <span className="live-pulse-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header style={styles.topHeader}>
        <div style={styles.brandGroup}>
          <div style={styles.brandIcon}>🛡️</div>
          <div>
            <div style={styles.brandTitle}>SECURE DOCUMENT-GATED TRADE GATEWAY</div>
            <div style={styles.brandSub}>Document Upload Required To Unlock Each Stage</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {workflowStep === 5 && (
            <div style={styles.liveIndicatorPill}>
              <span className="live-pulse-dot"></span>
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#10b981' }}>LIVE TRADE ACTIVE</span>
            </div>
          )}
          <div style={styles.stepBadgePill}>
            Current Stage: <strong>Step {workflowStep}</strong>
          </div>
        </div>
      </header>

      {/* STEP TRACKER WITH LOCK/UNLOCK STATUS */}
      <div style={styles.trackerBar}>
        {[
          { step: 1, label: '1. KYC Doc', doc: stepDocuments.step1 },
          { step: 2, label: '2. RFQ Spec', doc: stepDocuments.step2 },
          { step: 3, label: '3. Signed Contract', doc: stepDocuments.step3 },
          { step: 4, label: '4. Escrow Form', doc: stepDocuments.step4 },
          { step: 5, label: '5. Live Trade', doc: workflowStep === 5 }
        ].map((s) => {
          const isDone = workflowStep > s.step;
          const isCurrent = workflowStep === s.step;
          const hasDoc = !!s.doc;

          return (
            <div key={s.step} style={{ ...styles.trackerStep, color: isCurrent ? '#0f766e' : isDone ? '#10b981' : '#94a3b8', fontWeight: isCurrent ? '900' : '700' }}>
              <div style={{
                ...styles.trackerCircle,
                backgroundColor: isDone || (isCurrent && hasDoc) ? '#10b981' : isCurrent ? '#0f766e' : '#cbd5e1',
                color: '#fff'
              }}>
                {hasDoc ? '📄' : isDone ? '✓' : '🔒'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{s.label}</span>
                <span style={{ fontSize: '8.5px', color: hasDoc ? '#16a34a' : '#dc2626' }}>
                  {hasDoc ? 'Doc Verified ✓' : 'Doc Required 🔒'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <div style={styles.mainContainer}>

        {/* STEP 1: KYC FORM WITH MANDATORY UPLOAD */}
        {workflowStep === 1 && (
          <div style={styles.centeredCard}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '36px' }}>📋</div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '4px 0' }}>Step 1: Corporate KYC & Legal Proof</h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Attach your Certificate of Incorporation to unlock Step 2.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.inputLabel}>COMPANY NAME</label>
                <input type="text" value={kycData.companyName} onChange={e => setKycData({...kycData, companyName: e.target.value})} style={styles.inputField} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={styles.inputLabel}>TAX ID / EIN</label>
                  <input type="text" value={kycData.taxId} onChange={e => setKycData({...kycData, taxId: e.target.value})} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.inputLabel}>COUNTRY</label>
                  <input type="text" value={kycData.country} onChange={e => setKycData({...kycData, country: e.target.value})} style={styles.inputField} />
                </div>
              </div>

              {/* MANDATORY DOCUMENT BOX */}
              <div style={styles.docGateBox}>
                <div style={styles.docGateHeader}>
                  🔒 MANDATORY STEP 1 DOCUMENT: Certificate of Incorporation
                </div>
                <input
                  type="file"
                  onChange={e => handleStepDocAttach('step1', e.target.files[0])}
                  style={styles.fileInput}
                />
                {stepDocuments.step1 ? (
                  <div style={styles.attachedBadge}>
                    ✓ Attached: <strong>{stepDocuments.step1.name}</strong> ({stepDocuments.step1.size})
                  </div>
                ) : (
                  <div style={styles.lockWarning}>
                    ⚠️ Upload document above to unlock the button below.
                  </div>
                )}
              </div>

              <button
                type="button"
                style={styles.actionBtn}
                className="interactive-btn"
                disabled={!stepDocuments.step1}
                onClick={handleVerifyKYC}
              >
                {stepDocuments.step1 ? 'Unlock & Proceed to Step 2 🚀' : '🔒 Upload Document to Unlock'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TOP 5 SELLERS WITH SPEC SHEET LOCK */}
        {workflowStep === 2 && (
          <div style={{ width: '100%', maxWidth: '950px' }}>
            
            {/* MANDATORY DOCUMENT UPLOADER BANNER FOR STEP 2 */}
            <div style={{ ...styles.docGateBox, marginBottom: '16px', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>
                    🔒 STEP 2 UNLOCK MANDATE: Upload Purchase Intent / Specification Document
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Sellers will only receive RFQs that include your uploaded commodity spec file.
                  </div>
                </div>
                <input
                  type="file"
                  onChange={e => handleStepDocAttach('step2', e.target.files[0])}
                  style={{ width: '240px', fontSize: '11px' }}
                />
              </div>

              {stepDocuments.step2 && (
                <div style={{ ...styles.attachedBadge, marginTop: '8px' }}>
                  ✓ Spec Sheet Attached: <strong>{stepDocuments.step2.name}</strong>. You can now select a seller below.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Step 2: Select Exporter to Submit RFQ</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {TOP_5_SELLERS.map((seller, idx) => (
                <div key={seller.id} style={styles.sellerCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={styles.sellerAvatar}>{seller.avatar}</div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#0f766e', fontWeight: '900' }}>RANK #{idx + 1} EXPORTER</div>
                        <div style={{ fontSize: '15px', fontWeight: '900' }}>{seller.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {seller.location} • ⚓ Origin: {seller.originPort}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f766e' }}>${seller.unitPrice} / MT</div>
                      <span style={styles.badgePill}>{seller.badge}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>📦 Product: {seller.commodity}</span>
                    <button
                      style={styles.actionBtnCompact}
                      className="interactive-btn"
                      disabled={!stepDocuments.step2}
                      onClick={() => handleSelectSeller(seller)}
                    >
                      {stepDocuments.step2 ? 'Submit RFQ & Unlock Step 3 ⚡' : '🔒 Spec Doc Required'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CONTRACT & NEGOTIATION WITH BILATERAL CONTRACT LOCK */}
        {workflowStep === 3 && (
          <div style={{ width: '100%', maxWidth: '950px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div style={styles.cardBox}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 10px 0' }}>📝 Contract Terms</h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Supplier: <strong>{selectedSeller.name}</strong></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={styles.inputLabel}>ORDER QUANTITY (METRIC TONS)</label>
                  <input type="number" value={orderQuantity} onChange={e => setOrderQuantity(Number(e.target.value))} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.inputLabel}>AGREED PRICE PER MT ($)</label>
                  <input type="number" value={negotiatedPrice} onChange={e => setNegotiatedPrice(Number(e.target.value))} style={styles.inputField} />
                </div>

                <div style={styles.summaryBox}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>TOTAL TRADE CONTRACT VALUE</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f766e' }}>${totalPrice.toLocaleString()} USD</div>
                </div>

                {/* MANDATORY CONTRACT DOCUMENT UPLOADER */}
                <div style={styles.docGateBox}>
                  <div style={styles.docGateHeader}>
                    🔒 MANDATORY STEP 3 DOCUMENT: Executed Contract / Sales Agreement
                  </div>
                  <input
                    type="file"
                    onChange={e => handleStepDocAttach('step3', e.target.files[0])}
                    style={styles.fileInput}
                  />
                  {stepDocuments.step3 ? (
                    <div style={styles.attachedBadge}>
                      ✓ Contract Attached: <strong>{stepDocuments.step3.name}</strong>
                    </div>
                  ) : (
                    <div style={styles.lockWarning}>
                      ⚠️ Attach signed contract to unlock Step 4 (Stripe Escrow).
                    </div>
                  )}
                </div>

                {!isDealClosed ? (
                  <button
                    style={styles.actionBtn}
                    className="interactive-btn"
                    disabled={!stepDocuments.step3}
                    onClick={handleCloseDeal}
                  >
                    {stepDocuments.step3 ? 'Lock Terms & Unlock Escrow 🤝' : '🔒 Upload Contract to Unlock'}
                  </button>
                ) : (
                  <button style={{ ...styles.actionBtn, backgroundColor: '#16a34a' }} className="interactive-btn" onClick={() => setShowStripeModal(true)}>
                    Open Stripe Escrow Checkout 💳
                  </button>
                )}
              </div>
            </div>

            <div style={styles.cardBox}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 10px 0' }}>💬 Negotiation & Verification Chat</h3>
              <div style={styles.chatBox}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ ...styles.chatBubble, alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start', backgroundColor: m.sender === 'You' ? '#0f766e' : '#ffffff', color: m.sender === 'You' ? '#fff' : '#0f172a' }}>
                    <div style={{ fontSize: '9px', fontWeight: '800', opacity: 0.8 }}>{m.sender}</div>
                    <div style={{ fontSize: '11.5px', marginTop: '2px' }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type chat..." style={styles.inputField} disabled={isDealClosed} />
                <button type="submit" style={styles.secondaryBtn} disabled={isDealClosed}>Send</button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 5: VISIBLE LIVE TRADE MONITORING DASHBOARD */}
        {workflowStep === 5 && (
          <div style={{ width: '100%', maxWidth: '1050px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* LIVE TRADE TELEMETRY HEADER */}
            <div style={{ ...styles.cardBox, borderLeft: '6px solid #10b981', backgroundColor: '#f0fdf4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: '28px' }}>🚢</div>
                    <span className="live-pulse-dot" style={{ position: 'absolute', top: -2, right: -2 }}></span>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#166534', letterSpacing: '0.5px' }}>
                      ● REAL-TIME LIVE TRADE TELEMETRY VISIBLE
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#064e3b' }}>
                      Consignment #{liveTradeData.containerId}
                    </h2>
                    <div style={{ fontSize: '11px', color: '#15803d' }}>
                      Vessel: <strong>{liveTradeData.vesselName}</strong> | Exporter: <strong>{selectedSeller.name}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '800' }}>TOTAL ESCROW SECURED</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f766e' }}>
                    ${totalPrice.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* ROUTE PROGRESS BAR */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#166534', marginBottom: '6px' }}>
                  <span>📍 Origin: {selectedSeller.originPort}</span>
                  <span>🚢 Transit Progress: {liveTradeData.routeProgress}%</span>
                  <span>⚓ Destination: {selectedSeller.destPort}</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#dcfce7', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${liveTradeData.routeProgress}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
              </div>
            </div>

            {/* REAL-TIME TELEMETRY SENSORS & METRICS */}
            <div style={styles.telemetryGrid}>
              <div style={styles.sensorTile}>
                <span style={{ fontSize: '18px' }}>🌐</span>
                <div>
                  <div style={styles.sensorLabel}>CURRENT GPS COORDS</div>
                  <div style={styles.sensorValue}>{liveTradeData.lat}, {liveTradeData.lng}</div>
                </div>
              </div>

              <div style={styles.sensorTile}>
                <span style={{ fontSize: '18px' }}>🌡️</span>
                <div>
                  <div style={styles.sensorLabel}>CONTAINER TEMP</div>
                  <div style={styles.sensorValue}>{liveTradeData.tempC} (Optimal)</div>
                </div>
              </div>

              <div style={styles.sensorTile}>
                <span style={{ fontSize: '18px' }}>💧</span>
                <div>
                  <div style={styles.sensorLabel}>GRAIN HUMIDITY</div>
                  <div style={styles.sensorValue}>{liveTradeData.humidityPct} RH</div>
                </div>
              </div>

              <div style={styles.sensorTile}>
                <span style={{ fontSize: '18px' }}>⏱️</span>
                <div>
                  <div style={styles.sensorLabel}>ESTIMATED ARRIVAL</div>
                  <div style={styles.sensorValue}>{liveTradeData.etaDays} Days</div>
                </div>
              </div>
            </div>

            {/* LIVE ESCROW RELEASE & DOCUMENT-GATED TRANCHES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
              
              {/* ESCROW TRANCHES */}
              <div style={styles.cardBox}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 12px 0' }}>
                  💳 Escrow Milestone Tranches (Document Locked)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {escrowTranches.map(t => {
                    const isReleased = t.status === 'RELEASED';
                    const trancheVal = (totalPrice * (t.percent / 100)).toLocaleString();

                    return (
                      <div key={t.id} style={{ ...styles.trancheBox, backgroundColor: isReleased ? '#f0fdf4' : '#ffffff', borderColor: isReleased ? '#10b981' : '#e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800' }}>{t.name}</span>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: isReleased ? '#15803d' : '#64748b', backgroundColor: isReleased ? '#dcfce7' : '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                            {isReleased ? 'RELEASED ✓' : 'LOCKED 🔒'}
                          </span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f766e', marginTop: '4px' }}>
                          ${trancheVal} USD <span style={{ fontSize: '10px', color: '#64748b' }}>({t.percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button style={styles.secondaryBtn} className="interactive-btn" onClick={handleApproveQC}>
                    Approve QC (Requires SGS Doc) 🔍
                  </button>
                  <button style={styles.actionBtnCompact} className="interactive-btn" onClick={handleReleaseFinal}>
                    Final Release (Requires BL Doc) 🎉
                  </button>
                </div>
              </div>

              {/* LIVE AUDIT LOG */}
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', margin: 0 }}>📜 Live Audit Feed</h3>
                  <span className="live-pulse-dot"></span>
                </div>

                <div style={styles.auditLogContainer}>
                  {liveLogs.map(log => (
                    <div key={log.id} style={styles.logEntry}>
                      <div style={{ fontSize: '9.5px', color: '#0f766e', fontWeight: '800' }}>{log.time} • [{log.type}]</div>
                      <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>{log.text}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ATTACHED DOCUMENTS REPOSITORY */}
            <div style={styles.cardBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', margin: 0 }}>📂 Verified Document Repository for Active Trade</h3>
                <button style={styles.secondaryBtn} onClick={() => setShowUploadModal(true)}>+ Upload Additional Document</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {uploadedDocs.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>No live trade documents attached yet.</div>
                ) : (
                  uploadedDocs.map(doc => (
                    <div key={doc.id} style={styles.docTile}>
                      <div style={{ fontSize: '18px' }}>📄</div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800' }}>{doc.name}</div>
                        <div style={{ fontSize: '9.5px', color: '#0f766e' }}>{doc.type} • {doc.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* STRIPE POPUP MODAL WITH STEP 4 MANDATORY DOCUMENT REQUIREMENT */}
      {(showStripeModal || workflowStep === 4) && (
        <div style={styles.modalOverlay}>
          <div style={styles.stripeModalCard}>
            <div style={styles.stripeHeader}>
              <span style={{ fontWeight: '900', fontSize: '13px' }}>💳 Stripe Escrow Checkout (Step 4)</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowStripeModal(false)}>✕</button>
            </div>

            {paymentStatus === 'idle' && (
              <div style={{ padding: '18px' }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>TRANCHE 1 INITIAL DEPOSIT (25%)</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#6366f1' }}>${(totalPrice * 0.25).toLocaleString()} USD</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* MANDATORY STEP 4 UPLOAD */}
                  <div style={styles.docGateBox}>
                    <div style={{ ...styles.docGateHeader, color: '#4338ca' }}>
                      🔒 MANDATORY STEP 4 DOCUMENT: Bank Authorization / Wire Advice Form
                    </div>
                    <input
                      type="file"
                      onChange={e => handleStepDocAttach('step4', e.target.files[0])}
                      style={styles.fileInput}
                    />
                    {stepDocuments.step4 ? (
                      <div style={styles.attachedBadge}>
                        ✓ Attached: <strong>{stepDocuments.step4.name}</strong>
                      </div>
                    ) : (
                      <div style={styles.lockWarning}>
                        ⚠️ File required to enable deposit button.
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={styles.inputLabel}>CARD NUMBER</label>
                    <input type="text" value="•••• •••• •••• 4242" readOnly style={styles.inputField} />
                  </div>

                  <button
                    style={styles.stripePayBtn}
                    className="interactive-btn"
                    disabled={!stepDocuments.step4}
                    onClick={handleExecutePayment}
                  >
                    {stepDocuments.step4 ? `Deposit $${(totalPrice * 0.25).toLocaleString()} & Unlock Live Trade 🔒` : '🔒 Upload Authorization File First'}
                  </button>
                </div>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={styles.spinner}></div>
                <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '10px' }}>Verifying Document & Depositing to Escrow...</div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px' }}>🎉</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a' }}>Deposit & Document Verified!</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5 UPLOAD MODAL */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.uploadModalCard}>
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '800', fontSize: '12px' }}>📎 Upload Trade Document</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedFile) return;
              setUploadedDocs(prev => [{ id: `doc-${Date.now()}`, name: selectedFile.name, type: docCategory, time: 'Just now' }, ...prev]);
              setSelectedFile(null);
              setShowUploadModal(false);
              triggerToast(`📄 Document "${docCategory}" Attached! Requirements met.`);
            }} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={styles.inputLabel}>DOCUMENT CATEGORY</label>
                <select value={docCategory} onChange={e => setDocCategory(e.target.value)} style={styles.inputField}>
                  <option value="Bill of Lading (BL)">Bill of Lading (BL)</option>
                  <option value="QC Inspection Report">QC Inspection Report (SGS)</option>
                  <option value="Phytosanitary Certificate">Phytosanitary Certificate</option>
                  <option value="Certificate of Origin">Certificate of Origin</option>
                </select>
              </div>

              <div>
                <label style={styles.inputLabel}>ATTACH FILE (PDF, PNG, JPG)</label>
                <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={styles.fileInput} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" style={styles.secondaryBtn} onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" style={styles.actionBtnCompact} className="interactive-btn">Upload File 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- STYLES OBJECT ---
const styles = {
  appContainer: { width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  toastBanner: { position: 'fixed', top: '16px', right: '20px', color: '#ffffff', padding: '10px 18px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' },

  topHeader: { background: 'linear-gradient(135deg, #0f172a, #0f766e)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { width: '32px', height: '32px', backgroundColor: '#0f766e', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  brandTitle: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px' },
  brandSub: { fontSize: '9.5px', color: '#99f6e4' },

  liveIndicatorPill: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', border: '1px solid #a7f3d0' },
  stepBadgePill: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#fff' },

  trackerBar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', justifyContent: 'center', gap: '20px' },
  trackerStep: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' },
  trackerCircle: { width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' },

  mainContainer: { padding: '24px 16px', display: 'flex', justifyContent: 'center' },
  centeredCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' },
  cardBox: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },

  docGateBox: { backgroundColor: '#f8fafc', border: '1.5px dashed #0f766e', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' },
  docGateHeader: { fontSize: '10px', fontWeight: '900', color: '#0f766e' },
  attachedBadge: { fontSize: '10.5px', color: '#15803d', fontWeight: '800', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '4px' },
  lockWarning: { fontSize: '10px', color: '#b91c1c', fontWeight: '700' },

  inputLabel: { fontSize: '9px', fontWeight: '800', color: '#64748b', marginBottom: '3px', display: 'block' },
  inputField: { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', width: '100%', boxSizing: 'border-box' },
  fileInput: { padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '10.5px', width: '100%', backgroundColor: '#ffffff' },
  actionBtn: { backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', width: '100%' },
  actionBtnCompact: { backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },

  sellerCard: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  sellerAvatar: { fontSize: '24px', width: '38px', height: '38px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badgePill: { fontSize: '9px', fontWeight: '800', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '3px 6px', borderRadius: '8px' },

  chatBox: { height: '180px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  chatBubble: { maxWidth: '85%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  summaryBox: { padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' },

  telemetryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' },
  sensorTile: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' },
  sensorLabel: { fontSize: '9px', fontWeight: '800', color: '#64748b' },
  sensorValue: { fontSize: '12px', fontWeight: '900', color: '#0f172a' },

  trancheBox: { border: '1px solid', padding: '10px', borderRadius: '8px' },
  auditLogContainer: { height: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  logEntry: { backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #0f766e' },
  docTile: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', backgroundColor: '#f8fafc' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  stripeModalCard: { backgroundColor: '#ffffff', borderRadius: '10px', width: '380px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  stripeHeader: { backgroundColor: '#6366f1', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stripePayBtn: { backgroundColor: '#6366f1', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: '900', width: '100%' },
  spinner: { width: '30px', height: '30px', border: '3px solid #e0e7ff', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
  uploadModalCard: { backgroundColor: '#ffffff', borderRadius: '10px', width: '380px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }
};